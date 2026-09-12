import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string, secret: string) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(`${orderId}|${paymentId}`);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const generatedSignature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return generatedSignature === signature;
}

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    try {
      const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
      if (!razorpayKeySecret) {
        return Response.json({ error: "Razorpay credentials not configured" }, { status: 500, headers: corsHeaders });
      }

      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return Response.json({ error: "Missing authorization header" }, { status: 401, headers: corsHeaders });
      }

      const { data: { user }, error: userError } = await ctx.supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      if (userError || !user) {
         return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return Response.json({ error: "Missing payment verification parameters" }, { status: 400, headers: corsHeaders });
      }

      const isValid = await verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature, razorpayKeySecret);

      if (!isValid) {
        return Response.json({ error: "Invalid signature" }, { status: 400, headers: corsHeaders });
      }

      // Payment is verified! Use ctx.supabaseAdmin to bypass RLS and update the user's profile
      const { error: dbError } = await ctx.supabaseAdmin
        .from('profiles')
        .update({ is_pro: true })
        .eq('id', user.id);

      if (dbError) {
        throw dbError;
      }

      return Response.json({ success: true, message: "Payment verified successfully" }, { headers: corsHeaders });
    } catch (err: any) {
      return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
    }
  }),
};
