# Security Overview

This document outlines the security considerations and mechanisms implemented in the Stadium Copilot prototype, as well as the roadmap for hardening the application for production deployment.

## 1. Secrets Management
- **API Keys**: The Generative AI API key (`GEMINI_API_KEY`) is loaded exclusively on the server side via the Next.js App Router (`/app/api/agent/route.ts`).
- **No Client Exposure**: A full scan of the `/app` directory confirms the key is never accidentally included in client components or exposed to the browser.
- **Git Hygiene**: The `.env.local` file is explicitly ignored in `.gitignore`, preventing accidental commits of live keys. The repository only tracks `.env.example`, which contains placeholder values.

## 2. Input Validation and Sanitization
- **Request Validation**: The `/api/agent` route strictly verifies the `Content-Type` is `application/json` and rejects malformed bodies to prevent parsing crashes.
- **Payload Limits**: A strict 50KB `Content-Length` limit prevents oversized payload attacks from exhausting server memory.
- **Prompt Injection Defense**: A rudimentary sanitization function strips out common prompt-injection vectors (e.g., "ignore previous instructions"). While basic for this hackathon, it demonstrates an active defense-in-depth approach before the input reaches the LLM.

## 3. Rate Limiting
- **Mechanism**: The API route implements an in-memory IP-based rate limiter (max 10 requests per minute).
- **Testing**: Our integration test suite (`__tests__/agent.test.ts`) actively hammers the API with requests from a test IP, successfully verifying that the 11th request properly triggers a `429 Too Many Requests` status.

## 4. Production Roadmap (Out of Scope for Hackathon)
To transition this prototype to a secure, enterprise-grade production application, the following would be implemented:
1. **HTTPS Enforcement**: Ensure all traffic is routed over TLS/HTTPS with HSTS headers to protect data in transit.
2. **Distributed Rate Limiting**: Replace the in-memory `Map` with Redis (e.g., Upstash) to ensure rate limiting works correctly across multiple serverless instances (like Vercel Edge functions).
3. **Authentication & Authorization**: Implement NextAuth.js or Clerk to ensure only ticketed fans can access the Copilot, and only credentialed staff can access the Operations Dashboard.
4. **Advanced LLM Guardrails**: Replace rudimentary regex sanitization with a dedicated LLM security gateway (like NeMo Guardrails or Google Cloud Armor) to robustly detect prompt injections, jailbreaks, and sensitive data leaks.
5. **Data Privacy**: Ensure any user PII (like exact ticket numbers or seating locations) is encrypted at rest and anonymized before being included in the LLM context window.
