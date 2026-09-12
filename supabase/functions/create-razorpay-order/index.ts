import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    try {
      const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
      const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

      if (!razorpayKeyId || !razorpayKeySecret) {
        return Response.json({ error: "Razorpay credentials not configured on server" }, { status: 500, headers: corsHeaders });
      }

      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return Response.json({ error: "Missing authorization header" }, { status: 401, headers: corsHeaders });
      }

      const { data: { user }, error: userError } = await ctx.supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      if (userError || !user) {
         return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
      }

      const { amount, currency = "INR" } = await req.json();
      if (!amount) {
        return Response.json({ error: "Amount is required" }, { status: 400, headers: corsHeaders });
      }

      const authString = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${authString}`
        },
        body: JSON.stringify({
          amount: amount, 
          currency: currency,
          receipt: `receipt_${crypto.randomUUID().slice(0, 8)}`,
        })
      });

      const order = await response.json();

      if (!response.ok) {
        return Response.json({ error: order }, { status: response.status, headers: corsHeaders });
      }

      return Response.json(order, { headers: corsHeaders });
    } catch (err: any) {
      return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
    }
  }),
};
