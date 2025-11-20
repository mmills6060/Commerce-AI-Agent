export const maxDuration = 30;

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const backendResponse = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to process chat request",
          details: errorText 
        }),
        { 
          status: backendResponse.status,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(backendResponse.body, {
      headers: {
        "Content-Type": backendResponse.headers.get("Content-Type") || "text/event-stream; charset=utf-8",
        "Cache-Control": backendResponse.headers.get("Cache-Control") || "no-cache",
        "Connection": backendResponse.headers.get("Connection") || "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: "Failed to proxy chat request",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
