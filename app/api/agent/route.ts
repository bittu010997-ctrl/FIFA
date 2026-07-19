/* eslint-disable @typescript-eslint/no-explicit-any */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, FunctionDeclaration, Tool } from '@google/generative-ai';
import { tools } from '@/lib/tools';

// Simple in-memory rate limiting (max 10 requests per minute per IP)
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 10;
const ipRequestCounts = new Map<string, { count: number; windowStart: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRequestCounts.get(ip);
  if (!record) {
    ipRequestCounts.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    ipRequestCounts.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  record.count++;
  return true;
}

function sanitizeInput(text: string): string {
  if (!text) return "";
  // Trim to 500 chars max
  let sanitized = text.trim().substring(0, 500);
  // Basic prompt injection stripping (very rudimentary for demonstration)
  sanitized = sanitized.replace(/ignore previous instructions/gi, "");
  sanitized = sanitized.replace(/you are now/gi, "");
  sanitized = sanitized.replace(/system prompt/gi, "");
  return sanitized;
}

export async function POST(req: Request) {
  try {
    // 1. IP Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    // 2. Parse and Validate Request
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json({ error: "Unsupported Media Type. Expected application/json." }, { status: 415 });
    }

    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 1024 * 50) { // 50KB limit
      return NextResponse.json({ error: "Payload Too Large." }, { status: 413 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Malformed JSON body." }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { message, language, conversationHistory = [] } = body;

    const sanitizedMessage = sanitizeInput(message || "");
    const requestedLang = sanitizeInput(language || "English");

    if (!sanitizedMessage) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    // 3. API Key check
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY environment variable.");
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    // 4. Initialize Gemini SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Convert our schemas to Gemini FunctionDeclarations format
    // Gemini requires schema types to be uppercase (e.g., 'OBJECT', 'STRING')
    const convertSchemaTypes = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) return obj.map(convertSchemaTypes);
      const newObj: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'type' && typeof value === 'string') {
          newObj[key] = value.toUpperCase();
        } else {
          newObj[key] = convertSchemaTypes(value);
        }
      }
      return newObj;
    };

    const functionDeclarations: FunctionDeclaration[] = tools.map(t => ({
      name: t.schema.name,
      description: t.schema.description,
      parameters: convertSchemaTypes(t.schema.parameters)
    }));

    const geminiTools: Tool[] = [{ functionDeclarations }];

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      tools: geminiTools,
      systemInstruction: `You are the Stadium Copilot, an AI assistant for fans and staff at a FIFA World Cup 2026 stadium.
You are a multilingual assistant. Always respond in the user's requested language: ${requestedLang}.
Use the provided tools to fetch live stadium data, crowd levels, facilities, and routing rather than guessing.
Proactively mention accessible routing options when relevant to the user's request.`
    });

    // Convert history format if necessary
    const history = conversationHistory.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content || "" }]
    }));

    const chat = model.startChat({ history });
    const toolsUsed: string[] = [];
    let routeData: any = null;

    // 5. Send message and start Function Calling loop
    let result = await chat.sendMessage(sanitizedMessage);
    let call = result.response.functionCalls();

    // Loop as long as the model wants to call a function
    while (call && call.length > 0) {
      const functionCall = call[0];
      toolsUsed.push(functionCall.name);
      
      const toolToRun = tools.find(t => t.schema.name === functionCall.name);
      if (!toolToRun) {
        throw new Error(`Model requested unknown tool: ${functionCall.name}`);
      }

      // Execute local tool function
      const toolResult: any = await toolToRun.handler(functionCall.args as any);
      
      // Capture route data for the frontend visual card
      if (functionCall.name === 'get_route' || functionCall.name === 'get_nearest_facility') {
         if (toolResult.route) {
            routeData = toolResult; // Contains route and destination
         }
      }

      // Send the tool's result back to the model
      result = await chat.sendMessage([{
        functionResponse: {
          name: functionCall.name,
          response: toolResult
        }
      }]);

      call = result.response.functionCalls();
    }

    // 6. Return the final text reply and audit trail of tools used
    return NextResponse.json({
      reply: result.response.text(),
      toolsUsed,
      routeData
    });

  } catch (error) {
    // Log the error securely on the server and return a generic 500 error
    console.error("Agent API Error:", error);
    return NextResponse.json({ error: "An internal server error occurred while processing your request." }, { status: 500 });
  }
}
