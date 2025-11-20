const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function GET() {
  try {
    console.log("[Test] Attempting to connect to backend at:", BACKEND_URL);
    
    const response = await fetch(`${BACKEND_URL}/api/test`, {
      method: "GET",
    });

    console.log("[Test] Backend response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Test] Backend error:", errorText);
      
      return new Response(
        JSON.stringify({ 
          error: "Backend not accessible",
          status: response.status,
          url: `${BACKEND_URL}/api/test`,
          details: errorText
        }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const data = await response.json();
    console.log("[Test] Backend response:", data);

    return new Response(
      JSON.stringify({ 
        success: true,
        backend_url: BACKEND_URL,
        backend_response: data
      }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("[Test] Connection error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to connect to backend",
        backend_url: BACKEND_URL,
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

