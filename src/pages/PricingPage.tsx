import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { loadRazorpay } from '../lib/razorpay';
import { Check, Star } from 'lucide-react';

export default function PricingPage() {
    const { user, isAuthenticated, setAuthModalOpen } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleUpgrade = async () => {
        if (!isAuthenticated || !user) {
            setAuthModalOpen(true);
            return;
        }

        try {
            setIsProcessing(true);

            if (!supabase) {
                throw new Error('Supabase is not configured.');
            }

            // 1. Create order on the server
            const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
                body: { amount: 9900, currency: 'INR' } // ₹99
            });

            if (orderError || !orderData) {
                throw new Error(orderError?.message || 'Failed to create order');
            }

            // 2. Load Razorpay Script
            const res = await loadRazorpay();
            if (!res) {
                throw new Error('Razorpay SDK failed to load. Are you online?');
            }

            // 3. Initialize Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'InkTrail Premium',
                description: 'Lifetime Access to Pro Features',
                order_id: orderData.id,
                handler: async function (response: any) {
                    try {
                        // 4. Verify Payment on the server
                        const { data: verifyData, error: verifyError } = await supabase!.functions.invoke('verify-razorpay-payment', {
                            body: {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }
                        });

                        if (verifyError || !verifyData?.success) {
                            alert('Payment verification failed. Please contact support.');
                        } else {
                            alert('Payment successful! You are now a Pro member. Please refresh the page.');
                            window.location.reload();
                        }
                    } catch (err) {
                        console.error('Verification error:', err);
                        alert('Something went wrong during verification.');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                theme: {
                    color: '#6366f1',
                },
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.on('payment.failed', function (response: any) {
                alert('Payment failed: ' + response.error.description);
            });
            paymentObject.open();
        } catch (error: any) {
            console.error('Checkout error:', error);
            alert(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl tracking-tight mb-4">
                    Simple, transparent pricing
                </h1>
                <p className="text-xl text-slate-600">
                    Unlock all premium handwriting styles, remove watermarks, and get lifetime access to all future updates for a single one-time payment.
                </p>
            </div>

            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-600" />
                
                <div className="p-8 sm:p-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 inline-flex items-center gap-2">
                                <Star className="w-6 h-6 text-indigo-600 fill-indigo-600" />
                                Lifetime Pro
                            </h3>
                            <p className="text-slate-500 mt-1">One time payment</p>
                        </div>
                        <div className="text-right">
                            <span className="text-4xl font-extrabold text-slate-900">₹99</span>
                        </div>
                    </div>

                    <ul className="space-y-4 mb-8">
                        {[
                            'Access to all 54 Premium Fonts',
                            'No Watermarks on exports',
                            'High-resolution PDF downloads',
                            'Priority Cloud Backup',
                            'Lifetime access to all future updates'
                        ].map((feature, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                <span className="text-slate-700">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={handleUpgrade}
                        disabled={isProcessing || user?.isPro}
                        className={`w-full py-4 px-6 rounded-2xl text-white font-semibold text-lg transition-all duration-200 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2
                            ${user?.isPro 
                                ? 'bg-slate-800 cursor-not-allowed shadow-none' 
                                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-[0.98]'
                            }`}
                    >
                        {isProcessing ? 'Loading Checkout...' : (user?.isPro ? 'You are a Pro Member' : 'Upgrade to Pro Lifetime')}
                    </button>
                </div>
            </div>
        </main>
    );
}
