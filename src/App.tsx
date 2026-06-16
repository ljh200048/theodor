/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, onSnapshot, query, where, doc, deleteDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { ActivePage, Product, SiteSetting, Favorite } from "./types";

// Import Views
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeView from "./components/HomeView";
import ShopView from "./components/ShopView";
import ProductDetailView from "./components/ProductDetailView";
import NoticeView from "./components/NoticeView";
import AboutView from "./components/AboutView";
import LoginView from "./components/LoginView";
import SignupView from "./components/SignupView";
import MyPageView from "./components/MyPageView";
import AdminView from "./components/AdminView";

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>("Home");
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Firestore Sync States
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSetting | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [detailedProductId, setDetailedProductId] = useState<string | null>(null);

  // 1. Authenticated User Listeners
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Collections Listeners
  useEffect(() => {
    const unsubscribeProducts = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const list: Product[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          } as Product);
        });
        setProducts(list);
      },
      (error) => {
        console.error("Firestore loading products stream error:", error);
      }
    );

    const unsubscribeSettings = onSnapshot(
      doc(db, "siteSettings", "main"),
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(docSnap.data() as SiteSetting);
        } else {
          setSettings(null);
        }
      },
      (error) => {
        console.error("Firestore loading settings document stream error:", error);
      }
    );

    return () => {
      unsubscribeProducts();
      unsubscribeSettings();
    };
  }, []);

  // 3. Authenticated Wishlists Listener
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }

    const q = query(collection(db, "favorites"), where("userId", "==", user.uid));
    const unsubscribeFavs = onSnapshot(
      q,
      (snapshot) => {
        const list: Favorite[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Favorite);
        });
        setFavorites(list);
      },
      (error) => {
        console.error("Firestore loading list bookmark stream error:", error);
      }
    );

    return () => unsubscribeFavs();
  }, [user]);

  // Handle Logout
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setActivePage("Home");
    } catch (err) {
      console.error("Signout error:", err);
    }
  };

  // Toggle user bookmark wishlist
  const toggleFavorite = async (productId: string) => {
    if (!user) {
      setActivePage("Login");
      alert("찜하기 컬렉션을 활용하시려면 먼저 회원가입 및 로그인을 진행해 주세요.");
      return;
    }

    const path = "favorites";
    const existingFav = favorites.find((f) => f.productId === productId);

    try {
      if (existingFav) {
        await deleteDoc(doc(db, path, existingFav.id));
      } else {
        const favId = `fav_${user.uid}_${productId}`;
        await setDoc(doc(db, path, favId), {
          userId: user.uid,
          productId,
        });
      }
    } catch (error) {
      console.error("Wishlist operation Firestore write error:", error);
    }
  };

  const renderActivePage = () => {
    switch (activePage) {
      case "Home":
        return (
          <HomeView
            products={products}
            settings={settings}
            setActivePage={setActivePage}
            setDetailedProductId={setDetailedProductId}
          />
        );
      case "Shop":
        return (
          <ShopView
            products={products}
            setActivePage={setActivePage}
            setDetailedProductId={setDetailedProductId}
          />
        );
      case "ProductDetail":
        if (!detailedProductId) {
          setActivePage("Shop");
          return null;
        }
        const selectedProd = products.find((p) => p.id === detailedProductId);
        if (!selectedProd) {
          return (
            <div className="text-center py-24 text-stone-500 font-serif">
              지정하신 디테일 빈티지 의류를 찾을 수 없거나 이미 삭제되었습니다.
            </div>
          );
        }
        const isFavorited = favorites.some((f) => f.productId === selectedProd.id);
        return (
          <ProductDetailView
            product={selectedProd}
            user={user}
            isFavorited={isFavorited}
            toggleFavorite={toggleFavorite}
            onBack={() => {
              setActivePage("Shop");
              setDetailedProductId(null);
            }}
            settings={settings}
            setActivePage={setActivePage}
          />
        );
      case "Notice":
        return <NoticeView settings={settings} />;
      case "About":
        return <AboutView />;
      case "Login":
        return (
          <LoginView
            setActivePage={setActivePage}
            onLoginSuccess={() => setActivePage("Home")}
          />
        );
      case "Signup":
        return (
          <SignupView
            setActivePage={setActivePage}
            onSignupSuccess={() => setActivePage("Login")}
          />
        );
      case "MyPage":
        if (!user) {
          setActivePage("Login");
          return null;
        }
        return (
          <MyPageView
            user={user}
            products={products}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            setActivePage={setActivePage}
            setDetailedProductId={setDetailedProductId}
          />
        );
      case "Admin":
        if (!user || user.email !== "lch200048@gmail.com") {
          setActivePage("Home");
          return null;
        }
        return <AdminView products={products} settings={settings} />;
      default:
        return (
          <HomeView
            products={products}
            settings={settings}
            setActivePage={setActivePage}
            setDetailedProductId={setDetailedProductId}
          />
        );
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center items-center font-serif text-[#2C302E] space-y-4">
        <div className="w-8 h-8 border-2 border-[#8C624E] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs tracking-widest uppercase text-stone-400">Loading Member Profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#2C302E]">
      <Header
        activePage={activePage}
        setActivePage={setActivePage}
        user={user}
        isAdmin={user?.email === "lch200048@gmail.com"}
        onLogout={handleSignOut}
        setDetailedProductId={setDetailedProductId}
      />

      <main className="flex-grow transition-opacity duration-300">
        {renderActivePage()}
      </main>

      <Footer settings={settings} setActivePage={setActivePage} />
    </div>
  );
}

