
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { amount, orderId } = await req.json();

    // PhonePe API integration would go here
    // For now, we'll create a mock response structure
    console.log("Creating PhonePe payment for:", { amount, orderId, userEmail: user.email });

    // Mock PhonePe payment URL (replace with actual PhonePe API call)
    const merchantId = Deno.env.get("PHONEPE_MERCHANT_ID") || "MOCKMERCHANT";
    const apiKey = Deno.env.get("PHONEPE_API_KEY") || "mock-api-key";
    
    // In real implementation, you would:
    // 1. Create payment request with PhonePe API
    // 2. Generate payment URL
    // 3. Return the URL for redirection

    const mockPaymentUrl = `https://api.phonepe.com/apis/hermes/pg/v1/pay?merchantId=${merchantId}&orderId=${orderId}&amount=${amount}`;

    return new Response(JSON.stringify({ 
      success: true,
      paymentUrl: mockPaymentUrl,
      orderId: orderId 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("PhonePe payment error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to create PhonePe payment" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
