import React, { useState, useEffect } from "react";

const TELEGRAM_TOKEN = "8891357091:AAE7-uXzpA8hVgJO_nhdIMWFxHTOIdOaKgE";
const TELEGRAM_CHAT_ID = "6960362208";

async function sendTelegramNotification(order: {
  orderId: string;
  items: { product: { name: string; price: number }; selectedSize: string; quantity: number }[];
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  address: string;
  totalAmount: number;
  paymentType: string;
}) {
  const itemList = order.items.map(i => `  • ${i.product.name} (${i.selectedSize}) x${i.quantity} — ₩${(i.product.price * i.quantity).toLocaleString()}`).join("\n");
  const message = `🛍 새 주문 접수!\n━━━━━━━━━━━━━━\n주문번호: ${order.orderId}\n수령인: ${order.recipientName} (${order.recipientPhone})\n이메일: ${order.recipientEmail}\n배송지: ${order.address}\n결제수단: ${order.paymentType}\n━━━━━━━━━━━━━━\n주문상품:\n${itemList}\n━━━━━━━━━━━━━━\n총 결제금액: ₩${order.totalAmount.toLocaleString()}`;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message }),
    });
  } catch (err) {
    console.error("Telegram notification failed:", err);
  }
}
import { 
  ShoppingBag, 
  Trash2, 
  MapPin, 
  Globe, 
  CreditCard, 
  CheckCircle2, 
  ChevronRight, 
  Info, 
  ShieldCheck, 
  ArrowLeft, 
  User, 
  AlertTriangle,
  Clock,
  ArrowRight,
  X
} from "lucide-react";
import { Product, ActivePage } from "../types";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { sendOrderEmails } from "../utils/emailService";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

interface CartItem {
  id: string; // unique cart item id (productId + '_' + size)
  product: Product;
  selectedSize: string;
  quantity: number;
}

interface CartViewProps {
  products: Product[];
  user: any;
  setActivePage: (page: ActivePage) => void;
  setDetailedProductId: (id: string | null) => void;
  triggerLoginRedirect?: (page: ActivePage, prodId: string | null, notice: string | null) => void;
}

export default function CartView({
  products,
  user,
  setActivePage,
  setDetailedProductId,
  triggerLoginRedirect
}: CartViewProps) {
  // Steps: 1 = 장바구니, 2 = 주문서작성, 3 = 결제완료, 4 = 주문완료
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // Tab configuration for Step 2
  const [shippingTab, setShippingTab] = useState<"domestic" | "overseas">("domestic");

  // Step 2 Form States
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  
  // Domestic fields
  const [zipCode, setZipCode] = useState("");
  const [domesticAddress, setDomesticAddress] = useState("");
  
  // Overseas fields
  const [englishName, setEnglishName] = useState("");
  const [country, setCountry] = useState("USA");
  const [overseasAddress, setOverseasAddress] = useState("");
  const [overseasZip, setOverseasZip] = useState("");
  const [pcccCode, setPcccCode] = useState(""); // 개인통관고유부호

  const [deliveryNote, setDeliveryNote] = useState("");
  const [formError, setFormError] = useState("");

  // Payment states for Step 3
  const [paymentMethod, setPaymentMethod] = useState<"toss" | "bank">("toss");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showBankTransferModal, setShowBankTransferModal] = useState(false);

  // Finalized summary for Step 4
  const [finalOrderDetails, setFinalOrderDetails] = useState<{
    orderId: string;
    items: CartItem[];
    shippingType: "domestic" | "overseas";
    address: string;
    recipient: string;
    totalAmount: number;
    paymentType: string;
  } | null>(null);

  // Load cart items from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem("theodor_cart");
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (err) {
        console.error("Failed to parse cart from localStorage:", err);
      }
    }
  }, []);

  // Autofill login info
  useEffect(() => {
    if (user) {
      if (!recipientName) setRecipientName(user.displayName || "");
      if (!recipientEmail) setRecipientEmail(user.email || "");
    }
  }, [user]);

  // Scroll to top when changing steps to prevent layout being caught/stuck at the bottom
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);

  // Sync with localStorage
  const saveCartToStorage = (updatedCart: CartItem[]) => {
    setCartItems(updatedCart);
    localStorage.setItem("theodor_cart", JSON.stringify(updatedCart));
    // Trigger header updates
    window.dispatchEvent(new Event("storage"));
  };

  const updateQuantity = (itemId: string, diff: number) => {
    const updated = cartItems.map(item => {
      if (item.id === itemId) {
        const nextQty = Math.max(1, item.quantity + diff);
        return { ...item, quantity: nextQty };
      }
      return item;
    });
    saveCartToStorage(updated);
  };

  const removeCartItem = (itemId: string) => {
    const updated = cartItems.filter(item => item.id !== itemId);
    saveCartToStorage(updated);
  };

  // Get pricing totals
  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shippingFee = subtotal > 0 ? (shippingTab === "domestic" ? 3000 : 15000) : 0;
  const totalAmount = subtotal + shippingFee;

  // Validate step 2 details
  const handleProceedToPayment = () => {
    setFormError("");

    if (!recipientName.trim()) {
      setFormError("수령인 성함을 정확히 입력해 주세요.");
      return;
    }
    if (!recipientPhone.trim()) {
      setFormError("연락 가능한 수령인 전화번호를 기입해 주세요.");
      return;
    }
    if (!recipientEmail.trim() || !recipientEmail.includes("@")) {
      setFormError("올바른 이메일 주소를 작성해 주세요. (배송 이메일 가이드 및 송장 발부용)");
      return;
    }

    if (shippingTab === "domestic") {
      if (!domesticAddress.trim()) {
        setFormError("국내 거주지 배송지 주소를 상세히 기입해 주세요.");
        return;
      }
    } else {
      if (!englishName.trim()) {
        setFormError("해외 배송을 위한 수령인의 영문 성함을 입력해 주세요.");
        return;
      }
      if (!overseasAddress.trim()) {
        setFormError("해외 배송 수령지 전체 영문 주소를 입력해 주세요.");
        return;
      }
      if (!pcccCode.trim() || pcccCode.length < 10) {
        setFormError("개인통관고유부호(PCCC)를 정확히 입력해 주세요. (P로 시작하는 13자리 코드 필수)");
        return;
      }
    }

    // Move to step 3 (Payment)
    setStep(3);
  };

  // Process Toss Payments / Manual Checkout
  const handleCheckoutSubmit = async () => {
    setIsProcessingPayment(true);
    setPaymentError(null);

    const orderId = "order_" + Date.now();
    const addressStr = shippingTab === "domestic" 
      ? `(국내 - 우편번호: ${zipCode}) ${domesticAddress} [배송메모: ${deliveryNote}]`
      : `(해외 - ${country} / Postal Code: ${overseasZip}) ${overseasAddress} (통관부호: ${pcccCode}) [영문성명: ${englishName}] [배송메모: ${deliveryNote}]`;

    const itemsSummary = cartItems.map(item => `${item.product.name} (${item.selectedSize}) x${item.quantity}`).join(", ");

    try {
      if (paymentMethod === "toss") {
        // Trigger Tess key or standard SDK test client-key
        const clientKey = "test_ck_DLJOpm5QrlOaNNnR0KmAVPNdxbWn";
        const tossPayments = await loadTossPayments(clientKey);
        
        // Setup payment params
        const payment = tossPayments.payment({ customerKey: user?.uid || "guest_buyer_" + Date.now() });

        // Save progress details to localstorage to reconstruct on successful return
        localStorage.setItem("theodor_pending_order_info", JSON.stringify({
          orderId,
          cartItems,
          shippingTab,
          addressStr,
          recipientName,
          recipientPhone,
          recipientEmail,
          totalAmount
        }));

        await payment.requestPayment({
          method: "CARD",
          amount: {
            currency: "KRW",
            value: totalAmount,
          },
          orderId: orderId,
          orderName: itemsSummary.length > 50 ? itemsSummary.slice(0, 47) + "..." : itemsSummary,
          successUrl: window.location.origin + "/?tossCartPaymentSuccess=true",
          failUrl: window.location.origin + "/?tossCartPaymentFail=true",
          customerEmail: recipientEmail,
          customerName: recipientName,
        });

      } else {
        // Show bank transfer confirmation popup
        setShowBankTransferModal(true);
        setIsProcessingPayment(false);
      }
    } catch (err: any) {
      console.error("Checkout submission failed:", err);
      setPaymentError(err.message || "결제 연동이 시작되지 못했습니다. 임베디드 iframe 제한을 피하려면 [새 창에서 열기]를 사용해보시거나 무통장 이체 방식을 활용해 보세요.");
      setIsProcessingPayment(false);
    }
  };

  const executeBankTransferCheckout = async () => {
    setIsProcessingPayment(true);
    setPaymentError(null);
    setShowBankTransferModal(false);

    const orderId = "order_" + Date.now();
    const addressStr = shippingTab === "domestic" 
      ? `(국내 - 우편번호: ${zipCode}) ${domesticAddress} [배송메모: ${deliveryNote}]`
      : `(해외 - ${country} / Postal Code: ${overseasZip}) ${overseasAddress} (통관부호: ${pcccCode}) [영문성명: ${englishName}] [배송메모: ${deliveryNote}]`;

    const itemsSummary = cartItems.map(item => `${item.product.name} (${item.selectedSize}) x${item.quantity}`).join(", ");

    try {
      // Manual Bank Transfer Choice
      // 1. Post to Firebase Firestore
      for (const item of cartItems) {
        const orderDocRef = doc(db, "orders", `${orderId}_${item.product.id}`);
        await setDoc(orderDocRef, {
          id: `${orderId}_${item.product.id}`,
          userId: user?.uid || "guest",
          userEmail: recipientEmail,
          productId: item.product.id,
          productName: item.product.name,
          productPrice: item.product.price,
          productImageUrl: item.product.imageUrl,
          recipientName: recipientName.trim(),
          recipientPhone: recipientPhone.trim(),
          shippingAddress: addressStr,
          size: item.selectedSize,
          status: "pending", // Pending manual payment verification
          createdAt: serverTimestamp(),
        });
      }

      // 2. Trigger order confirmation emails
      try {
        await sendOrderEmails({
          orderId: orderId,
          productName: itemsSummary,
          productPrice: totalAmount,
          recipientName: recipientName.trim(),
          recipientPhone: recipientPhone.trim(),
          shippingAddress: addressStr,
          size: cartItems.map(i => `${i.product.name}: ${i.selectedSize}`).join(", "),
          buyerEmail: recipientEmail,
        });
      } catch (emailErr) {
        console.error("Order confirmation email failed:", emailErr);
      }

      // Complete!
      setFinalOrderDetails({
        orderId,
        items: [...cartItems],
        shippingType: shippingTab,
        address: addressStr,
        recipient: recipientName,
        totalAmount,
        paymentType: "Direct Bank Transfer"
      });

      // Telegram notification
      await sendTelegramNotification({
        orderId,
        items: cartItems,
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        recipientEmail,
        address: addressStr,
        totalAmount,
        paymentType: "무통장 계좌이체",
      });

      // Clear cart
      localStorage.removeItem("theodor_cart");
      setCartItems([]);
      window.dispatchEvent(new Event("storage"));

      setStep(4);
    } catch (err: any) {
      console.error("Manual Transfer checkout failed:", err);
      setPaymentError(err.message || "주문 등록 중 오류가 발생했습니다.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Check callback on mount in case redirection returns immediately
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const parsedSuccess = params.get("tossCartPaymentSuccess") === "true";
    
    if (parsedSuccess) {
      const pendingInfoStr = localStorage.getItem("theodor_pending_order_info");
      if (pendingInfoStr) {
        try {
          const info = JSON.parse(pendingInfoStr);
          
          // Re-populate and immediately process to complete step
          setFinalOrderDetails({
            orderId: info.orderId,
            items: info.cartItems,
            shippingType: info.shippingTab,
            address: info.addressStr,
            recipient: info.recipientName,
            totalAmount: info.totalAmount,
            paymentType: "Toss Payments Card"
          });

          // Sync database
          const syncDb = async () => {
            for (const item of info.cartItems) {
              const orderDocRef = doc(db, "orders", `${info.orderId}_${item.product.id}`);
              await setDoc(orderDocRef, {
                id: `${info.orderId}_${item.product.id}`,
                userId: user?.uid || "guest",
                userEmail: info.recipientEmail,
                productId: item.product.id,
                productName: item.product.name,
                productPrice: item.product.price,
                productImageUrl: item.product.imageUrl,
                recipientName: info.recipientName.trim(),
                recipientPhone: info.recipientPhone.trim(),
                shippingAddress: info.addressStr,
                size: item.selectedSize,
                status: "completed", // Secured instantly
                createdAt: serverTimestamp(),
              });
            }

            // Trigger email service
            try {
              await sendOrderEmails({
                orderId: info.orderId,
                productName: info.cartItems.map((i: any) => i.product.name).join(", "),
                productPrice: info.totalAmount,
                recipientName: info.recipientName,
                recipientPhone: info.recipientPhone,
                shippingAddress: info.addressStr,
                size: info.cartItems.map((i: any) => `${i.product.name}: ${i.selectedSize}`).join(", "),
                buyerEmail: info.recipientEmail,
              });
            } catch (err) {
              console.error("Callback mail dispatch failure:", err);
            }

            // Telegram notification
            await sendTelegramNotification({
              orderId: info.orderId,
              items: info.cartItems,
              recipientName: info.recipientName,
              recipientPhone: info.recipientPhone,
              recipientEmail: info.recipientEmail,
              address: info.addressStr,
              totalAmount: info.totalAmount,
              paymentType: "토스페이먼츠 카드결제",
            });
          };

          syncDb();

          // Clear cart & pending order
          localStorage.removeItem("theodor_cart");
          localStorage.removeItem("theodor_pending_order_info");
          setCartItems([]);
          window.dispatchEvent(new Event("storage"));

          // Clean url
          window.history.replaceState({}, document.title, window.location.origin + "/?activePage=Cart");
          setStep(4);
        } catch (err) {
          console.error("Failed handling callback reconstruction:", err);
        }
      }
    }
  }, []);

  // Quick action helper for simulated testing flow
  const handleSimulatedTossComplete = async () => {
    setIsProcessingPayment(true);
    setPaymentError(null);

    const orderId = "order_sim_" + Date.now();
    const addressStr = shippingTab === "domestic" 
      ? `(국내 - 우편번호: ${zipCode}) ${domesticAddress} [배송메모: ${deliveryNote}]`
      : `(해외 - ${country} / Postal Code: ${overseasZip}) ${overseasAddress} (통관부호: ${pcccCode}) [영문성명: ${englishName}] [배송메모: ${deliveryNote}]`;

    const itemsSummary = cartItems.map(item => `${item.product.name} (${item.selectedSize})`).join(", ");

    try {
      // Create Firebase Orders
      for (const item of cartItems) {
        const orderDocRef = doc(db, "orders", `${orderId}_${item.product.id}`);
        await setDoc(orderDocRef, {
          id: `${orderId}_${item.product.id}`,
          userId: user?.uid || "guest",
          userEmail: recipientEmail,
          productId: item.product.id,
          productName: item.product.name,
          productPrice: item.product.price,
          productImageUrl: item.product.imageUrl,
          recipientName: recipientName.trim(),
          recipientPhone: recipientPhone.trim(),
          shippingAddress: addressStr,
          size: item.selectedSize,
          status: "completed", // Instantly completed simulation
          createdAt: serverTimestamp(),
        });
      }

      // Email dispatch
      try {
        await sendOrderEmails({
          orderId: orderId,
          productName: itemsSummary,
          productPrice: totalAmount,
          recipientName: recipientName.trim(),
          recipientPhone: recipientPhone.trim(),
          shippingAddress: addressStr,
          size: cartItems.map(i => `${i.product.name}: ${i.selectedSize}`).join(", "),
          buyerEmail: recipientEmail,
        });
      } catch (ee) {
        console.error("Simulation mail output error:", ee);
      }

      setFinalOrderDetails({
        orderId,
        items: [...cartItems],
        shippingType: shippingTab,
        address: addressStr,
        recipient: recipientName,
        totalAmount,
        paymentType: "Toss Payments (Iframe Simulated Success)"
      });

      // Telegram notification
      await sendTelegramNotification({
        orderId,
        items: cartItems,
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        recipientEmail,
        address: addressStr,
        totalAmount,
        paymentType: "가상 데모 결제 (테스트)",
      });

      // Clear cart
      localStorage.removeItem("theodor_cart");
      setCartItems([]);
      window.dispatchEvent(new Event("storage"));

      setStep(4);
    } catch (err: any) {
      setPaymentError(err.message || "시뮬레이션 승인 중 오류가 발생했습니다.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
      
      {/* 4-Step Checkout Breadcrumb Bar */}
      <div className="mb-10 block">
        <div className="flex justify-between items-center bg-[#FAF7F0] border border-[#8C624E]/10 rounded-xs py-3 px-6 shadow-[0_1px_2px_rgba(0,0,0,0.01)] text-center">
          <div className="flex-1 flex justify-center items-center gap-1">
            <span className={`text-[10px] md:text-xs font-mono font-bold px-2 py-0.5 rounded-full ${step === 1 ? "bg-[#8C624E] text-[#FAF7F0]" : "bg-stone-200 text-stone-500"}`}>
              01
            </span>
            <span className={`text-[10px] md:text-xs tracking-widest font-serif font-bold ${step === 1 ? "text-[#8C624E]" : "text-stone-400"}`}>장바구니</span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-stone-300" />

          <div className="flex-1 flex justify-center items-center gap-1">
            <span className={`text-[10px] md:text-xs font-mono font-bold px-2 py-0.5 rounded-full ${step === 2 ? "bg-[#8C624E] text-[#FAF7F0]" : "bg-stone-200 text-stone-500"}`}>
              02
            </span>
            <span className={`text-[10px] md:text-xs tracking-widest font-serif font-bold ${step === 2 ? "text-[#8C624E]" : "text-stone-400"}`}>주문서작성</span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-stone-300" />

          <div className="flex-1 flex justify-center items-center gap-1">
            <span className={`text-[10px] md:text-xs font-mono font-bold px-2 py-0.5 rounded-full ${step === 3 ? "bg-[#8C624E] text-[#FAF7F0]" : "bg-stone-200 text-stone-500"}`}>
              03
            </span>
            <span className={`text-[10px] md:text-xs tracking-widest font-serif font-bold ${step === 3 ? "text-[#8C624E]" : "text-stone-400"}`}>결제완료</span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-stone-300" />

          <div className="flex-1 flex justify-center items-center gap-1">
            <span className={`text-[10px] md:text-xs font-mono font-bold px-2 py-0.5 rounded-full ${step === 4 ? "bg-[#1A3020] text-white" : "bg-stone-200 text-stone-500"}`}>
              04
            </span>
            <span className={`text-[10px] md:text-xs tracking-widest font-serif font-bold ${step === 4 ? "text-[#1A3020] uppercase font-semibold" : "text-stone-400"}`}>주문완료</span>
          </div>
        </div>
      </div>

      {/* ==================== STEP 01: 장바구니 리스트 ==================== */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-serif text-[#2C302E] tracking-tight">Your Vintage Archive Cart</h2>
          
          {cartItems.length === 0 ? (
            <div className="border border-stone-200 bg-white/60 p-16 text-center rounded-xs space-y-4">
              <ShoppingBag className="w-10 h-10 mx-auto text-stone-300 stroke-[1.2]" />
              <p className="text-xs text-stone-500 leading-relaxed font-serif">
                장바구니가 비어 있습니다.<br />
                테오도르 소장용 하이퀄리티 아카이브에서 단 한 조각뿐인 작품들을 데려오세요.
              </p>
              <button
                onClick={() => setActivePage("Shop")}
                className="inline-block bg-[#2C302E] hover:bg-[#8C624E] text-[#FAF7F0] text-xs px-6 py-3 uppercase tracking-widest transition-colors font-semibold font-mono rounded-xs"
              >
                Go Shop (의류 보러가기)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart List */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex bg-white border border-[#8C624E]/10 p-4 rounded-xs shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:border-[#8C624E]/25 transition-all">
                    <img 
                      src={item.product.imageUrl || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=150&h=150"} 
                      alt={item.product.name} 
                      className="w-20 h-24 object-cover rounded-xs border border-stone-100 shrink-0 bg-stone-50"
                    />
                    <div className="ml-4 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-serif font-semibold text-[#2C302E] leading-snug">{item.product.name}</h4>
                          <button
                            onClick={() => removeCartItem(item.id)}
                            className="text-stone-300 hover:text-red-500 p-1 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="mt-1 flex items-center space-x-2 text-[10px] text-stone-500 font-mono">
                          <span className="uppercase tracking-widest bg-stone-100 px-2 py-0.5 rounded-full">Size: {item.selectedSize}</span>
                          <span className="capitalize">{item.product.category}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center border border-stone-200 bg-stone-50 rounded-xs">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-2.5 py-1 text-xs text-stone-500 hover:bg-stone-200 transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-mono font-medium text-[#2C302E]">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-2.5 py-1 text-xs text-stone-500 hover:bg-stone-200 transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs md:text-sm font-semibold text-[#8C624E] font-serif">
                          ₩{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary widget */}
              <div className="bg-[#FAF7F0]/40 border border-[#8C624E]/10 p-6 rounded-xs space-y-6 h-fit shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                <h3 className="text-sm uppercase tracking-widest font-mono font-bold text-[#2C302E]/60 border-b border-[#8C624E]/10 pb-3">주문 요약 (Summary)</h3>
                
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-stone-500">
                    <span>수량 합계 (Subtotal)</span>
                    <span className="font-mono">₩{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>기본 배송비 (Shipping)</span>
                    <span className="font-mono">{shippingFee === 0 ? "무료" : `₩${shippingFee.toLocaleString()}`}</span>
                  </div>
                  
                  <div className="border-t border-[#8C624E]/10 my-4 pt-4 flex justify-between font-bold text-[#2C302E]">
                    <span className="text-sm font-serif">최종 주문 금액</span>
                    <span className="text-base text-[#8C624E] font-serif font-bold">₩{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-[10px] text-stone-500 leading-relaxed font-sans mt-4 bg-[#FDFBF7] p-3 border border-stone-200/50">
                  ⚠️ <strong>품절 주의</strong>: 테오도르의 모든 아카이브 피스는 오직 세계에 하나뿐인 독점적 빈티지 의류입니다. 결제가 지연 수령되는 동안 다른 오더와 중첩될 수 있습니다.
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-[#8C624E] hover:bg-[#754f3d] text-[#FAF7F0] py-3.5 text-xs sm:text-sm uppercase tracking-widest font-semibold transition-all shadow-md active:scale-98 text-center flex items-center justify-center space-x-1.5 focus:outline-hidden cursor-pointer rounded-xs"
                >
                  <span>주문서 작성 단계로 (Step 02)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== STEP 02: 주문서 작성 (국내 / 해외배송 탭) ==================== */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <button onClick={() => setStep(1)} className="text-stone-400 hover:text-[#2C302E] transition-colors p-1">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-xl md:text-2xl font-serif text-[#2C302E] tracking-tight">02. Recipient Order Sheet</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              
              {/* Shipping Method Tab Segment */}
              <div className="border border-stone-200 rounded-sm overflow-hidden bg-white shadow-xs">
                <div className="grid grid-cols-2 text-center border-b border-stone-100">
                  <button
                    type="button"
                    onClick={() => setShippingTab("domestic")}
                    className={`py-3 text-xs tracking-widest uppercase font-semibold flex items-center justify-center space-x-1.5 transition-all text-center cursor-pointer ${
                      shippingTab === "domestic"
                        ? "bg-[#8C624E]/5 border-b-2 border-[#8C624E] text-[#8C624E]"
                        : "text-stone-400 hover:text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="font-serif">국내배송 (Domestic Shipping)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShippingTab("overseas")}
                    className={`py-3 text-xs tracking-widest uppercase font-semibold flex items-center justify-center space-x-1.5 transition-all text-center cursor-pointer ${
                      shippingTab === "overseas"
                        ? "bg-[#8C624E]/5 border-b-2 border-[#8C624E] text-[#8C624E]"
                        : "text-stone-400 hover:text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span className="font-serif">해외배송 (Overseas Shipping)</span>
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  <h3 className="text-xs uppercase tracking-widest font-mono font-bold text-stone-500 mb-2">
                    {shippingTab === "domestic" ? "국내 거주 고객 수령 시 배송 정보" : "해외 거주 글로벌 배송 수령 가이드"}
                  </h3>

                  {formError && (
                    <div className="bg-red-50 border border-red-100 p-3 text-[11px] text-red-600 rounded-xs flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-[#2C302E]/60 block mb-1 font-mono font-bold">
                        Recipient Name (수령자 성함) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full bg-[#FAF7F0]/40 border border-[#8C624E]/10 rounded-xs py-2 px-3 text-xs focus:outline-hidden focus:border-[#8C624E]"
                        placeholder="실명 수령인을 기입해 주세요"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-[#2C302E]/60 block mb-1 font-mono font-bold">
                        Phone Number (연락처 / Mobile) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        className="w-full bg-[#FAF7F0]/40 border border-[#8C624E]/10 rounded-xs py-2 px-3 text-xs focus:outline-hidden focus:border-[#8C624E]"
                        placeholder="배송 알림용 수신 번호 (- 제외)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-[#2C302E]/60 block mb-1 font-mono font-bold">
                      Recipient Email (주문 전송용 이메일) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full bg-[#FAF7F0]/40 border border-[#8C624E]/10 rounded-xs py-2 px-3 text-xs focus:outline-hidden focus:border-[#8C624E]"
                      placeholder="your-email@example.com"
                    />
                  </div>

                  {/* DOMESTIC SHIPPING TAB FIELDS */}
                  {shippingTab === "domestic" ? (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                          <label className="text-[9px] uppercase tracking-widest text-[#2C302E]/60 block mb-1 font-mono font-bold">
                            ZIP Code (우편번호)
                          </label>
                          <input
                            type="text"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            className="w-full bg-[#FAF7F0]/40 border border-[#8C624E]/10 rounded-xs py-2 px-3 text-xs focus:outline-hidden focus:border-[#8C624E]"
                            placeholder="우편번호"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[9px] uppercase tracking-widest text-[#2C302E]/60 block mb-1 font-mono font-bold">
                            Domestic Address (수령 상세 배송지) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={domesticAddress}
                            onChange={(e) => setDomesticAddress(e.target.value)}
                            className="w-full bg-[#FAF7F0]/40 border border-[#8C624E]/10 rounded-xs py-2 px-3 text-xs focus:outline-hidden focus:border-[#8C624E]"
                            placeholder="상세 우편배송지와 동호수 등 기재"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // OVERSEAS SHIPPING TAB FIELDS
                    <div className="space-y-4 pt-2 border-t border-stone-100 mt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] uppercase tracking-widest text-[#2C302E]/60 block mb-1 font-mono font-bold">
                            English Recipient Name (영문 수령인 성함) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={englishName}
                            onChange={(e) => setEnglishName(e.target.value)}
                            className="w-full bg-[#FAF7F0]/40 border border-[#8C624E]/10 rounded-xs py-2 px-3 text-xs focus:outline-hidden focus:border-[#8C624E]"
                            placeholder="e.g. John Doe"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] uppercase tracking-widest text-[#2C302E]/60 block mb-1 font-mono font-bold">
                            Country of Destination (배송 대상 국가) <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full bg-[#FAF7F0]/40 border border-[#8C624E]/10 rounded-xs py-2 px-3 text-xs focus:outline-hidden focus:border-[#8C624E]"
                          >
                            <option value="USA">United States (미국)</option>
                            <option value="Japan">Japan (일본)</option>
                            <option value="China">China (중국)</option>
                            <option value="Canada">Canada (캐나다)</option>
                            <option value="Germany">Germany (독일)</option>
                            <option value="UK">United Kingdom (영국)</option>
                            <option value="France">France (프랑스)</option>
                            <option value="Australia">Australia (호주)</option>
                            <option value="Singapore">Singapore (싱가포르)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="text-[9px] uppercase tracking-widest text-[#2C302E]/60 block mb-1 font-mono font-bold">
                            English Street Address (전체 해외 영문 주소) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={overseasAddress}
                            onChange={(e) => setOverseasAddress(e.target.value)}
                            className="w-full bg-[#FAF7F0]/40 border border-[#8C624E]/10 rounded-xs py-2 px-3 text-xs focus:outline-hidden focus:border-[#8C624E]"
                            placeholder="e.g. 123 Vintage Ave, Apt B, NY"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="text-[9px] uppercase tracking-widest text-[#2C302E]/60 block mb-1 font-mono font-bold">
                            Zip/Postal Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={overseasZip}
                            onChange={(e) => setOverseasZip(e.target.value)}
                            className="w-full bg-[#FAF7F0]/40 border border-[#8C624E]/10 rounded-xs py-2 px-3 text-xs focus:outline-hidden focus:border-[#8C624E]"
                            placeholder="Postal Code"
                          />
                        </div>
                      </div>

                      <div className="bg-[#1A3020]/5 p-4 border border-[#1A3020]/15 rounded-xs space-y-2">
                        <div className="flex items-center space-x-1">
                          <ShieldCheck className="w-4 h-4 text-[#1A3020]" />
                          <label className="text-[10px] uppercase tracking-widest text-[#1A3020] font-mono font-medium">
                            Personal Customs Code (개인통관고유부호 필수) <span className="text-red-500">*</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          required
                          value={pcccCode}
                          onChange={(e) => setPcccCode(e.target.value.toUpperCase())}
                          className="w-full bg-white border border-[#1A3020]/20 rounded-xs py-2 px-3 text-xs uppercase font-mono tracking-widest focus:outline-hidden focus:border-[#1A3020]"
                          placeholder="P123456789012"
                        />
                        <p className="text-[9px] text-[#1A3020]/70 font-sans leading-relaxed">
                          * 해외 발품 및 직송 해외 배송 통관 시 대한민국 관세청 법률 규정에 따른 '개인통관고유부호(P로 시작하는 13자리 대문자 기호)' 입력이 필수적으로 수반됩니다.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <label className="text-[9px] uppercase tracking-widest text-[#2C302E]/60 block mb-1 font-mono font-bold">
                      Delivery Request Note (배송 요청사항)
                    </label>
                    <textarea
                      rows={2}
                      value={deliveryNote}
                      onChange={(e) => setDeliveryNote(e.target.value)}
                      className="w-full bg-[#FAF7F0]/40 border border-[#8C624E]/10 rounded-xs py-2 px-3 text-xs focus:outline-hidden focus:border-[#8C624E] resize-none"
                      placeholder="공동현관 비밀번호, 경비실 보관 등 전달 사항"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Price review summary */}
            <div className="space-y-6">
              <div className="bg-[#FAF7F0]/40 border border-[#8C624E]/10 p-6 rounded-xs space-y-6 h-fit shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                <h3 className="text-xs uppercase tracking-widest font-mono font-bold text-[#2C302E]/60 border-b border-[#8C624E]/10 pb-3">주문 수량 확인</h3>
                
                <div className="max-h-48 overflow-y-auto space-y-3 pr-2 border-b border-[#8C624E]/10 pb-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs text-stone-600">
                      <span className="truncate max-w-[120px] font-serif pr-1">{item.product.name} ({item.selectedSize})</span>
                      <span className="font-mono text-stone-400">x{item.quantity}</span>
                      <span className="font-mono text-right shrink-0">₩{(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-stone-500">
                    <span>선택 배송비 ({shippingTab === "domestic" ? "국내 기본" : "해외 할증"})</span>
                    <span className="font-mono">₩{shippingFee.toLocaleString()}</span>
                  </div>
                  
                  <div className="border-t border-[#8C624E]/10 my-4 pt-4 flex justify-between font-bold text-[#2C302E]">
                    <span className="text-sm font-serif">결제액 합계</span>
                    <span className="text-base text-[#8C624E] font-serif font-bold">₩{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleProceedToPayment}
                  className="w-full bg-[#2C302E] hover:bg-[#8C624E] text-[#FAF7F0] py-3.5 text-xs uppercase tracking-widest font-semibold transition-all shadow-md active:scale-98 text-center flex items-center justify-center space-x-1.5 focus:outline-hidden cursor-pointer rounded-xs"
                >
                  <span>결제 단계로 진행 (Step 03)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== STEP 03: 결제완료 (결제 수단 및 Toss Payments trigger) ==================== */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <button onClick={() => setStep(2)} className="text-stone-400 hover:text-[#2C302E] transition-colors p-1">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-xl md:text-2xl font-serif text-[#2C302E] tracking-tight">03. Secure Checkout Payment</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              
              <div className="border border-stone-200 bg-white rounded-sm p-6 space-y-6 shadow-xs">
                
                {paymentError && (
                  <div className="bg-red-50 border border-red-100 p-4 text-xs text-red-700 rounded-xs space-y-2 leading-relaxed">
                    <div className="flex items-start space-x-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span>결제 연동이 지연 또는 대기 취소되었습니다.</span>
                    </div>
                    <p className="text-[11px] font-sans pl-5 text-stone-600">
                      AI Studio 미리보기(임베디드 iframe) 내에서는 웹 브라우저의 팝업 및 보안 차단 조치로 인해 정상적인 토스페이먼츠 연동 결제가 반려될 수 있습니다.<br/><br/>
                      <strong>해결 방법:</strong><br/>
                      1) 화면 우측 상단의 <strong>[새 창에서 열기]</strong>를 클릭해 전면 브라우저로 띄운 후 Toss 카드를 실행해 보세요.<br/>
                      2) 혹은 1초 만에 테스트가 통과되는 하단의 <strong>[가상 데모 결제 승인]</strong>을 사용하여 완결 처리를 완료해 보세요.<br/>
                      3) 편리한 <strong>'무통장 계좌이체'</strong> 옵션을 선택하여 송금 시 24시간 즉시 처리가 도모됩니다.
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-widest font-mono font-bold text-[#2C302E]/60">배송 수령 및 연락 목적지</h3>
                  <div className="bg-stone-50 border border-stone-100 p-4 rounded-xs text-xs space-y-2 font-mono">
                    <div>
                      <span className="text-stone-400">수령자:</span> <span className="font-sans font-bold text-stone-800">{recipientName}</span> ({recipientPhone})
                    </div>
                    <div>
                      <span className="text-stone-400">수령주소:</span> <span className="font-sans text-stone-600">
                        {shippingTab === "domestic" ? domesticAddress : overseasAddress}
                      </span>
                    </div>
                    {shippingTab === "overseas" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-stone-500 pt-2 border-t border-stone-200">
                        <div><span className="text-stone-400">대상국:</span> {country}</div>
                        <div><span className="text-stone-400">통관고유부호:</span> {pcccCode}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-widest font-mono font-bold text-[#2C302E]/60 block mb-1">
                    Payment Selection (결제 수단 및 제휴사 정보)
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("toss")}
                      className={`flex flex-col items-center justify-center p-5 rounded-xs border transition-all text-center cursor-pointer ${
                        paymentMethod === "toss"
                          ? "border-[#8C624E] bg-[#8C624E]/5 text-[#8C624E]"
                          : "border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100 shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                      }`}
                    >
                      <ShieldCheck className="w-5 h-5 mb-1.5" />
                      <span className="text-xs font-serif font-bold block">토스페이먼츠</span>
                      <span className="text-[10px] mt-0.5 opacity-80 font-sans">신용카드 / 간편결제</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bank")}
                      className={`flex flex-col items-center justify-center p-5 rounded-xs border transition-all text-center cursor-pointer ${
                        paymentMethod === "bank"
                          ? "border-[#8C624E] bg-[#8C624E]/5 text-[#8C624E]"
                          : "border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100 shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                      }`}
                    >
                      <Clock className="w-5 h-5 mb-1.5" />
                      <span className="text-xs font-serif font-bold block">무통장 계좌이체</span>
                      <span className="text-[10px] mt-0.5 opacity-80 font-sans">24시간 내 수동 직접 송금</span>
                    </button>
                  </div>
                </div>

                {paymentMethod === "bank" && (
                  <div className="bg-[#FAF7F0] border border-[#8C624E]/15 p-4 rounded-xs text-xs space-y-2 leading-relaxed">
                    <div className="flex items-center space-x-1.5 text-stone-800 font-bold font-serif">
                      <Clock className="w-4 h-4 text-[#8C624E]" />
                      <span>무통장 계좌 안내</span>
                    </div>
                    <div className="pl-5 space-y-1 font-sans text-stone-600">
                      <div>카카오뱅크 <strong>3333365056455</strong> (예금주: 신종민)</div>
                      <div className="text-[11px] text-[#8C624E] font-medium">주문 후 3영업일 이내 입금해주세요. 입금 확인 후 배송이 시작됩니다.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Confirm Checkout column */}
            <div className="space-y-6">
              <div className="bg-[#FAF7F0]/40 border border-[#8C624E]/10 p-6 rounded-xs space-y-6 h-fit shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                <h3 className="text-xs uppercase tracking-widest font-mono font-bold text-[#2C302E]/60 border-b border-[#8C624E]/10 pb-3">결제요약</h3>

                <div className="space-y-3.5 text-xs text-stone-600 font-mono">
                  <div className="flex justify-between">
                    <span>수량 합계</span>
                    <span>₩{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>배송 종류</span>
                    <span>{shippingTab === "domestic" ? "국내 거주지" : "해외 항공물류"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>배송 요금</span>
                    <span>₩{shippingFee.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-[#8C624E]/10 my-3 pt-3 flex justify-between font-bold text-stone-800 font-serif">
                    <span className="text-xs">총 실결제 금액</span>
                    <span className="text-sm font-bold text-[#8C624E]">₩{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleCheckoutSubmit}
                    disabled={isProcessingPayment}
                    className={`w-full text-white py-3.5 px-4 text-xs tracking-widest uppercase font-semibold rounded-xs shadow-md active:scale-98 text-center flex items-center justify-center space-x-1.5 focus:outline-hidden cursor-pointer ${
                      isProcessingPayment ? "bg-stone-400 cursor-not-allowed" : "bg-[#8C624E] hover:bg-[#754f3d]"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{isProcessingPayment ? "결제 중..." : "결제 진행하기 (PAY NOW)"}</span>
                  </button>

                  {/* Fallback button for simulated checkout directly inside the sandbox/iframe */}
                  <button
                    onClick={handleSimulatedTossComplete}
                    disabled={isProcessingPayment}
                    className="w-full bg-[#1A3020]/10 hover:bg-[#1A3020]/20 text-[#1A3020] border border-[#1A3020]/20 py-2.5 px-4 text-[11px] uppercase tracking-widest font-mono transition-all text-center flex items-center justify-center space-x-1.5 focus:outline-hidden cursor-pointer rounded-xs"
                    title="Simulate payment inside the embedded workspace"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1A3020]" />
                    <span>가상 데모 결제 완료 (Iframe 우회용)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== STEP 04: 주문완료 (성공 확인서) ==================== */}
      {step === 4 && finalOrderDetails && (
        <div className="bg-white border border-[#8C624E]/10 rounded-sm p-8 md:p-12 text-center max-w-2xl mx-auto space-y-8 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="space-y-3">
            <h2 className="text-xl md:text-2xl font-serif text-[#1C3A24] font-bold">04. Order Complete - Thank You</h2>
            <p className="text-xs text-stone-500 font-serif leading-relaxed">
              테오도르 소장용 아카이브 기획의 영감 서신을 선점해주셔서 감사드립니다.<br />
              고객님의 소중한 빈티지 피스들이 성스럽게 보장 포장되어 발송될 예정입니다.
            </p>
          </div>

          <div className="border border-[#8C624E]/10 bg-[#FAF7F0]/30 rounded-xs p-6 text-left text-xs space-y-4 font-mono leading-relaxed">
            <div className="border-b border-[#8C624E]/10 pb-2.5 flex justify-between items-center text-[#2C302E]">
              <span className="font-bold text-[10px] uppercase tracking-widest text-[#2C302E]/60 text-left">주문 성 명세서</span>
              <span className="text-[10px] bg-[#8C624E]/10 text-[#8C624E] px-2 py-0.5 rounded-xs font-bold font-sans">SUCCESS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div><span className="text-stone-400">주문부호 ID:</span> <span className="font-bold text-stone-800">{finalOrderDetails.orderId}</span></div>
                <div><span className="text-stone-400">수령 대리인:</span> <span className="text-stone-700 font-sans">{finalOrderDetails.recipient}</span></div>
                <div><span className="text-stone-400">결제 구분액:</span> <span className="text-[#8C624E] font-bold">₩{finalOrderDetails.totalAmount.toLocaleString()}</span></div>
                <div><span className="text-stone-400">결제 수단사:</span> <span className="text-stone-600">{finalOrderDetails.paymentType}</span></div>
              </div>
              <div className="space-y-1.5">
                <div>
                  <span className="text-stone-400">도착배송처:</span> <span className="text-stone-600 font-sans text-[11px] block lines-clamp-2 md:inline pl-1 md:pl-0">
                    {finalOrderDetails.address}
                  </span>
                </div>
                <div><span className="text-stone-400">배송 구분:</span> <span className="text-stone-700">{finalOrderDetails.shippingType === "domestic" ? "국내 특송 배송" : "해외 발품 위탁"}</span></div>
              </div>
            </div>

            <div className="border-t border-[#8C624E]/10 pt-3">
              <span className="text-[10px] text-[#2C302E]/60 block mb-1.5 font-bold uppercase tracking-widest">주문 제품 리스트</span>
              <div className="space-y-1">
                {finalOrderDetails.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white/60 p-2 border border-stone-100 rounded-xs text-[11px] font-sans text-stone-600">
                    <span className="font-serif font-semibold truncate max-w-[200px]">{item.product.name}</span>
                    <span className="font-mono text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">Size: {item.selectedSize}</span>
                    <span className="font-mono text-stone-500">x{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#1A3020]/5 p-4 border border-[#1A3020]/15 rounded-sm flex items-start space-x-2.5 text-left text-[11px] text-[#1A3020] font-sans leading-relaxed">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong>송장 발부 및 확인 안내 서신</strong>
              <p className="text-stone-600">주문 및 수령 주소 세부 안내서가 입력하신 수신용 이메일로 자동 전송되었습니다. 마이페이지 (My Page) 내의 세부 오더 히스토리 카드에서도 주문 성을 24시간 실시간 조율 및 조회 가능합니다.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setActivePage("Shop");
                setStep(1);
              }}
              className="border border-[#2C302E] hover:bg-[#2C302E]/5 font-mono font-bold text-xs py-3.5 uppercase tracking-widest transition-colors cursor-pointer rounded-xs"
            >
              Continue Shopping (더 쇼핑하기)
            </button>

            <button
              onClick={() => {
                setActivePage("MyPage");
                setStep(1);
              }}
              className="bg-[#2C302E] hover:bg-[#8C624E] text-[#FAF7F0] font-mono font-bold text-xs py-3.5 uppercase tracking-widest transition-colors cursor-pointer rounded-xs shadow-md"
            >
              Go to My Orders (주문 보러가기)
            </button>
          </div>
        </div>
      )}

      {/* Bank Transfer Guide Popup/Modal */}
      {showBankTransferModal && (
        <div className="fixed inset-0 bg-[#2C302E]/75 backdrop-blur-xs flex items-center justify-center z-[1000] p-4 animate-fade-in">
          <div className="bg-[#FDFBF7] border border-[#8C624E]/15 rounded-sm max-w-md w-full shadow-2xl relative p-6 space-y-6 animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#FAF7F0]/80 pb-3">
              <div className="flex items-center space-x-2 text-[#8C624E]">
                <Clock className="w-5 h-5" />
                <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-[#2C302E]">
                  입금 안내 (Bank Transfer Guide)
                </h3>
              </div>
              <button 
                onClick={() => setShowBankTransferModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info contents */}
            <div className="space-y-4 text-xs sm:text-sm text-stone-600 font-sans leading-relaxed">
              <p className="text-[11px] text-stone-500 italic">
                아래 계좌 정보로 입금해 주시면, 확인 즉시 아카이브 배송 포장 절차가 개시됩니다.
              </p>

              <div className="bg-[#FAF7F0] p-4 border border-[#8C624E]/10 rounded-xs space-y-3 font-mono">
                <div className="flex justify-between items-center py-1 border-b border-dashed border-stone-200">
                  <span className="text-stone-400 text-xs">은행명</span>
                  <span className="text-stone-800 font-bold font-sans">카카오뱅크</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-dashed border-stone-200">
                  <span className="text-stone-400 text-xs">계좌번호</span>
                  <span className="text-stone-800 font-bold select-all tracking-wider text-sm">3333365056455</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-stone-400 text-xs">예금주</span>
                  <span className="text-stone-800 font-bold font-sans">신종민</span>
                </div>
              </div>

              <div className="bg-[#8C624E]/5 border border-[#8C624E]/15 p-3.5 rounded-xs">
                <p className="text-xs text-[#8C624E] leading-normal font-medium text-center font-sans">
                  "주문 후 3영업일 이내 입금해주세요. 입금 확인 후 배송이 시작됩니다."
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-2 border-t border-[#FAF7F0]/80">
              <button
                type="button"
                onClick={() => setShowBankTransferModal(false)}
                className="flex-1 border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-semibold py-2.5 rounded-xs cursor-pointer transition-colors text-center"
              >
                취소
              </button>
              <button
                type="button"
                onClick={executeBankTransferCheckout}
                className="flex-1 bg-[#2C302E] hover:bg-[#8C624E] text-[#FAF7F0] text-xs font-semibold py-2.5 rounded-xs cursor-pointer transition-colors text-center shadow-md"
              >
                확인 및 주문 완료
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

