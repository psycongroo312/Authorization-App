import { http, HttpResponse } from "msw";

let codeIssuedAt = Date.now();
const CODE_LIFETIME = 30_000;

export const handlers = [
  http.post("/api/login", async ({ request }) => {
    try {
      const { email, password } = (await request.json()) as {
        email: string;
        password: string;
      };

      console.log("MSW: /api/login", { email, password });

      if (!email || !password) {
        return HttpResponse.json(
          { error: "Missing email or password" },
          { status: 400 },
        );
      }

      if (email !== "test@example.com" || password !== "Password123") {
        return HttpResponse.json(
          { error: "Incorrect email or password" },
          { status: 401 },
        );
      }

      codeIssuedAt = Date.now();

      return HttpResponse.json({
        token: "fake-jwt-token",
        requires2FA: true,
      });
    } catch {
      return HttpResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 },
      );
    }
  }),

  http.post("/api/request-new-2fa", () => {
    codeIssuedAt = Date.now();
    console.log("MSW: New 2FA code issued at", new Date().toISOString());

    return HttpResponse.json({
      success: true,
      message: "New code issued",
    });
  }),

  http.post("/api/verify-2fa", async ({ request }) => {
    try {
      const { code } = (await request.json()) as { code: string };

      console.log("MSW: /api/verify-2fa", {
        code,
        timeSinceIssue: Date.now() - codeIssuedAt,
      });

      if (Date.now() - codeIssuedAt > CODE_LIFETIME) {
        return HttpResponse.json(
          { error: "Code has expired" },
          { status: 410 },
        );
      }

      if (code !== "123456") {
        return HttpResponse.json({ error: "Invalid code" }, { status: 401 });
      }

      return HttpResponse.json({
        success: true,
        message: "Authenticated",
      });
    } catch {
      return HttpResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
  }),
];
