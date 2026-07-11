# Security Design & Threat Model

Security is a primary judging criterion. We have designed Jal-Kavach to follow strict security standards.

## Threat Mitigations

| Threat | Risk | Mitigation |
| :--- | :--- | :--- |
| **API Key Leakage** | Critical | Gemini private key and Weather API keys are processed **exclusively on the server-side** using Next.js Server Actions. They are never exposed to the client bundle. |
| **Google Maps Key Abuse** | Medium | Google Maps JavaScript API key must run client-side. We restrict this key within the Google Cloud Console to specific referral URLs (e.g. localhost during dev, vercel.app during prod). |
| **Input Injection / Prompt Injection** | High | User search terms and location params are sanitized before transmission. Gemini prompts are structured with strict instructions to restrict model deviations. |
| **Credential Hardcoding** | Critical | No passwords or keys are committed to Git. A `.env.example` file is shipped, and active keys are stored securely as Environment Variables in Vercel. |
| **Database Exposure** | Medium | Firestore read/write capabilities are scoped safely. We provide fallback local storage structures to prevent database exploits. |
