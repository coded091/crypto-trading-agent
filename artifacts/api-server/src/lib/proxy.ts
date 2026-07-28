import { type Request, type Response } from "express";
import { logger } from "./logger";

const PYTHON_API_URL = process.env["PYTHON_API_URL"];

function getPythonApiUrl(): string {
  if (!PYTHON_API_URL) {
    throw new Error(
      "PYTHON_API_URL environment variable is not set. " +
        "Set it to the base URL of your Python API (e.g. http://localhost:8000).",
    );
  }
  return PYTHON_API_URL.replace(/\/$/, "");
}

/**
 * Forward a GET request to the Python API and stream the response back.
 * Preserves query parameters and status codes.
 */
export async function proxyGet(
  req: Request,
  res: Response,
  upstreamPath: string,
): Promise<void> {
  let baseUrl: string;
  try {
    baseUrl = getPythonApiUrl();
  } catch (err) {
    req.log.error({ err }, "PYTHON_API_URL not configured");
    res.status(503).json({
      error:
        "Python API URL not configured. Set the PYTHON_API_URL environment variable.",
    });
    return;
  }

  const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  const upstreamUrl = `${baseUrl}${upstreamPath}${qs}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { Accept: "application/json" },
    });

    const body = await upstream.json();
    res.status(upstream.status).json(body);
  } catch (err) {
    req.log.error({ err, upstreamUrl }, "Upstream Python API request failed");
    res.status(502).json({
      error: "Failed to reach the Python API. Is it running?",
      url: upstreamUrl,
    });
  }
}
