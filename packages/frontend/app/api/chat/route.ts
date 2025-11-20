export const maxDuration = 30;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, system, tools } = body;

    console.log("[Frontend API] Received chat request with", messages?.length, "messages");

    if (!messages || !Array.isArray(messages)) {
      console.error("[Frontend API] Invalid messages format:", messages);
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Call backend to get AI response
    console.log("[Frontend API] Calling backend at:", `${BACKEND_URL}/api/chat`);

    const backendResponse = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    console.log("[Frontend API] Backend response status:", backendResponse.status);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error("[Frontend API] Backend error:", errorText);
      
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

    console.log("[Frontend API] Streaming response back to client");
    
    // Just pass through the stream from backend
    return new Response(backendResponse.body, {
      headers: {
        "Content-Type": backendResponse.headers.get("Content-Type") || "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[Frontend API] Chat proxy error:", error);
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
