
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.id) throw new Error("User not authenticated");

    const { errandId, amount, serviceFee } = await req.json();

    // Verify errand belongs to user
    const { data: errand, error: errandError } = await supabaseClient
      .from('errands')
      .select('*')
      .eq('id', errandId)
      .eq('user_id', user.id)
      .single();

    if (errandError || !errand) {
      throw new Error("Errand not found or access denied");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "ngn",
      metadata: {
        errand_id: errandId,
        user_id: user.id,
        service_fee: serviceFee.toString(),
      },
    });

    // Update errand with payment intent ID
    await supabaseClient
      .from('errands')
      .update({ 
        stripe_payment_intent_id: paymentIntent.id,
        payment_status: 'pending'
      })
      .eq('id', errandId);

    // Create payment record
    await supabaseClient
      .from('payments')
      .insert({
        errand_id: errandId,
        user_id: user.id,
        runner_id: errand.runner_id,
        amount: amount,
        service_fee: serviceFee,
        runner_fee: serviceFee * 0.80,
        platform_fee: serviceFee * 0.20,
        stripe_payment_intent_id: paymentIntent.id,
        payment_status: 'pending'
      });

    return new Response(
      JSON.stringify({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error('Payment intent creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
