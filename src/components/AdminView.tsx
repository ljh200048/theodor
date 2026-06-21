/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Settings,
  Plus,
  Edit2,
  Trash2,
  Star,
  Check,
  AlertCircle,
  UploadCloud,
  MessageSquare,
  Sparkles,
  RefreshCw,
  X,
  FileText,
  Mail,
  Loader2,
  User,
} from "lucide-react";
import { Product, SiteSetting, Inquiry, MoodCard } from "../types";
import { collection, doc, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { ref as sRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, handleFirestoreError, OperationType } from "../firebase";
import { DEFAULT_PRODUCTS, DEFAULT_SETTINGS, DEFAULT_MOOD_CARDS } from "../mockData";
import { User as FirebaseUser } from "firebase/auth";

interface AdminViewProps {
  products: Product[];
  settings: SiteSetting | null;
  moodCards: MoodCard[];
  user: FirebaseUser | null;
}

type AdminTab = "settings" | "products" | "inquiries" | "moodCards";

export const ADMIN_EMAIL = "jongminsin81@gmail.com";
export const IMG_PLACEHOLDER = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80";

export default function AdminView({ products, settings, moodCards, user }: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  
  const isAdmin = user?.email === ADMIN_EMAIL;

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-24 text-center space-y-4 p-8 bg-[#FAF7F0] border border-red-200 text-[#2C302E]">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
        <h2 className="text-xl font-serif">접근 권한이 없습니다</h2>
        <p className="text-xs text-stone-500 font-light">
          관리자만 이 페이지에 접근하거나 수정할 수 있습니다.
        </p>
      </div>
    );
  }

  // Site setting forms states
  const [heroImg, setHeroImg] = useState(settings?.heroImageUrl || "");
  const [noticeTitle, setNoticeTitle] = useState(settings?.noticeTitle || "");
  const [noticeText, setNoticeText] = useState(settings?.noticeText || "");
  const [instaUrl, setInstaUrl] = useState(settings?.instagramUrl || "");
  const [contactUrl, setContactUrl] = useState(settings?.contactUrl || "");
  
  // Event Slot state variables
  const [eventTitle, setEventTitle] = useState(settings?.eventTitle || "");
  const [eventText, setEventText] = useState(settings?.eventText || "");
  const [eventLink, setEventLink] = useState(settings?.eventLink || "");
  const [eventBadge, setEventBadge] = useState(settings?.eventBadge || "");
  const [isEventActive, setIsEventActive] = useState(settings?.isEventActive ?? false);

  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Sync settings when they load
  useEffect(() => {
    if (settings) {
      setHeroImg(settings.heroImageUrl || "");
      setNoticeTitle(settings.noticeTitle || "");
      setNoticeText(settings.noticeText || "");
      setInstaUrl(settings.instagramUrl || "");
      setContactUrl(settings.contactUrl || "");
      setEventTitle(settings.eventTitle || "");
      setEventText(settings.eventText || "");
      setEventLink(settings.eventLink || "");
      setEventBadge(settings.eventBadge || "");
      setIsEventActive(settings.isEventActive ?? false);
    }
  }, [settings]);

  // Product form states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [category, setCategory] = useState("Tops");
  const [size, setSize] = useState("");
  const [condition, setCondition] = useState("S: Mint Condition");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);

  // New detailed product states
  const [detailDescription, setDetailDescription] = useState("");
  const [measurements, setMeasurements] = useState("");
  const [material, setMaterial] = useState("");
  const [shippingInfo, setShippingInfo] = useState("");
  const [notice, setNotice] = useState("");
  const [detailImageUrls, setDetailImageUrls] = useState<string[]>([]);
  const [tempProductId, setTempProductId] = useState<string>("");
  const [uploadingDetailFiles, setUploadingDetailFiles] = useState(false);

  useEffect(() => {
    if (!editingProduct && !tempProductId) {
      setTempProductId(`product_${Date.now()}`);
    }
  }, [editingProduct, tempProductId]);

  const getActiveProductId = () => {
    if (editingProduct) return editingProduct.id;
    if (!tempProductId) {
      const newId = `product_${Date.now()}`;
      setTempProductId(newId);
      return newId;
    }
    return tempProductId;
  };

  const handleDetailImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!isAdmin) {
      setUploadError("관리자만 이미지를 업로드할 수 있습니다.");
      return;
    }

    setUploadingDetailFiles(true);
    setUploadError("");
    setUploadSuccess("");

    const activeProdId = getActiveProductId();
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `${Date.now()}_${i}_${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
        const path = `products/detail/${activeProdId}/${fileName}`;
        const storageRef = sRef(storage, path);

        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        uploadedUrls.push(url);
      }

      setDetailImageUrls((prev) => [...prev, ...uploadedUrls]);
      setUploadSuccess(`${files.length}개의 상세 이미지가 성공적으로 업로드되었습니다!`);
    } catch (err: any) {
      console.error("Detail Storage upload failed:", err);
      setUploadError("상세 이미지 업로드에 실패했습니다. Storage 권한 혹은 규칙을 점검해 주세요.");
    } finally {
      setUploadingDetailFiles(false);
    }
  };

  // Upload progress simulation or state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  // Inquiries collection states
  const [allInquiries, setAllInquiries] = useState<Inquiry[]>([]);
  const [loadingInqs, setLoadingInqs] = useState(true);
  const [replyTextMap, setReplyTextMap] = useState<{ [inquiryId: string]: string }>({});
  const [replySubmitting, setReplySubmitting] = useState<{ [inquiryId: string]: boolean }>({});

  const [formErr, setFormErr] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [productSaving, setProductSaving] = useState(false);

  // Categories and Conditions variables
  const categories = ["Tops", "Dresses", "Outerwear", "Accessories", "Shoes"];
  const conditions = ["S: Mint Condition", "A: Excellent Vintage", "B: Nicely Faded Charm", "C: Heavy Aged Vibe"];

  // MoodCard form states
  const [editingMood, setEditingMood] = useState<MoodCard | null>(null);
  const [moodTitle, setMoodTitle] = useState("");
  const [moodTags, setMoodTags] = useState("");
  const [moodImageUrl, setMoodImageUrl] = useState("");
  const [moodLinkUrl, setMoodLinkUrl] = useState("");
  const [moodOrder, setMoodOrder] = useState<number>(1);
  const [moodIsActive, setMoodIsActive] = useState(true);
  const [moodFormErr, setMoodFormErr] = useState("");
  const [moodFormSuccess, setMoodFormSuccess] = useState("");
  const [moodSaving, setMoodSaving] = useState(false);

  // Fetch all user inquiries in system
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "inquiries"),
      (snapshot) => {
        const list: Inquiry[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          } as Inquiry);
        });
        list.sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());
        setAllInquiries(list);
        setLoadingInqs(false);
      },
      (error) => {
        console.error("Admin loaded inquiries stream error:", error);
        setLoadingInqs(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Update layout and set forms on editing
  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setPrice(prod.price);
    setCategory(prod.category);
    setSize(prod.size);
    setCondition(prod.condition);
    setDescription(prod.description);
    setImageUrl(prod.imageUrl);
    setIsSoldOut(prod.isSoldOut);
    setIsRecommended(prod.isRecommended);
    setDetailDescription((prod as any).detailDescription || "");
    setMeasurements((prod as any).measurements || "");
    setMaterial((prod as any).material || "");
    setShippingInfo((prod as any).shippingInfo || "");
    setNotice((prod as any).notice || "");
    setDetailImageUrls((prod as any).detailImageUrls || []);
    setFormErr("");
    setFormSuccess("");
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setName("");
    setPrice(0);
    setCategory("Tops");
    setSize("");
    setCondition("S: Mint Condition");
    setDescription("");
    setImageUrl("");
    setIsSoldOut(false);
    setIsRecommended(false);
    setDetailDescription("");
    setMeasurements("");
    setMaterial("");
    setShippingInfo("");
    setNotice("");
    setDetailImageUrls([]);
    setTempProductId("");
    setFormErr("");
    setFormSuccess("");
  };

  // Image Upload helper functions (Storage)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "hero" | "product" | "moodCards") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAdmin) {
      setUploadError("관리자만 이미지를 업로드할 수 있습니다.");
      return;
    }

    setUploadingFile(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      // Create path products/, site/hero/ or moodCards/
      let folder = "products";
      if (field === "hero") {
        folder = "site/hero";
      } else if (field === "moodCards") {
        folder = "moodCards";
      }
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
      const path = `${folder}/${fileName}`;
      const storageRef = sRef(storage, path);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      if (field === "hero") {
        setHeroImg(url);
        // Save to Firestore siteSettings/main IMMEDIATELY
        const pathSettings = "siteSettings";
        await setDoc(doc(db, pathSettings, "main"), {
          heroImageUrl: url,
          noticeTitle: noticeTitle || DEFAULT_SETTINGS.noticeTitle,
          noticeText: noticeText || DEFAULT_SETTINGS.noticeText,
          instagramUrl: instaUrl || DEFAULT_SETTINGS.instagramUrl,
          contactUrl: contactUrl || DEFAULT_SETTINGS.contactUrl,
          eventTitle,
          eventText,
          eventLink,
          eventBadge,
          isEventActive,
        }, { merge: true });
        setUploadSuccess("메인 이미지가 변경되었습니다.");
      } else if (field === "moodCards") {
        setMoodImageUrl(url);
        setUploadSuccess("무드 카드 이미지 업로드가 성공적으로 완료되었습니다!");
        if (editingMood) {
          const cardId = editingMood.id;
          const cardRef = doc(db, "moodCards", cardId);
          await setDoc(cardRef, { 
            title: moodTitle.trim() || editingMood.title || "",
            tags: moodTags.trim() || editingMood.tags || "",
            imageUrl: url || "",
            linkUrl: moodLinkUrl.trim() || editingMood.linkUrl || "",
            order: Number(moodOrder) || Number(editingMood.order) || 1,
            isActive: moodIsActive !== false,
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
      } else {
        setImageUrl(url);
        setUploadSuccess("이미지 업로드가 성공적으로 완료되었습니다!");
      }
    } catch (err: any) {
      console.error("Storage upload failed:", err);
      setUploadError("이미지 업로드에 실패했습니다. Storage 권한 혹은 규칙을 점검해 주세요.");
    } finally {
      setUploadingFile(false);
    }
  };

  // Save changes to Site Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsSuccess(false);
    const path = "siteSettings";

    try {
      // document ID 'main' for layout
      await setDoc(doc(db, path, "main"), {
        heroImageUrl: heroImg,
        noticeTitle,
        noticeText,
        instagramUrl: instaUrl,
        contactUrl,
        eventTitle: eventTitle.trim(),
        eventText: eventText.trim(),
        eventLink: eventLink.trim(),
        eventBadge: eventBadge.trim(),
        isEventActive,
      }, { merge: true });
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 4000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setSettingsSaving(false);
    }
  };

  // Products adding and editing operations
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !size.trim() || !imageUrl.trim() || !description.trim() || price < 0) {
      setFormErr("모든 입력 요소를 채워주시고 숫자를 양수로 입력해 주십시오.");
      return;
    }

    setProductSaving(true);
    setFormErr("");
    setFormSuccess("");
    const path = "products";

    try {
      if (editingProduct) {
        // UPDATE existing product using setDoc with { merge: true }
        const prodRef = doc(db, path, editingProduct.id);
        await setDoc(prodRef, {
          name: name.trim(),
          price: Number(price),
          category,
          size: size.trim(),
          condition,
          description: description.trim(),
          imageUrl: imageUrl.trim(),
          isSoldOut,
          isRecommended,
          detailDescription: detailDescription.trim(),
          measurements: measurements.trim(),
          material: material.trim(),
          shippingInfo: shippingInfo.trim(),
          notice: notice.trim(),
          detailImageUrls,
        }, { merge: true });
        setFormSuccess("상품 정보가 성공적으로 업데이트되었습니다!");
        cancelEdit();
      } else {
        // ADD new product with unique ID
        const activeId = getActiveProductId();
        const prodRef = doc(db, path, activeId);
        await setDoc(prodRef, {
          name: name.trim(),
          price: Number(price),
          category,
          size: size.trim(),
          condition,
          description: description.trim(),
          imageUrl: imageUrl.trim(),
          isSoldOut,
          isRecommended,
          detailDescription: detailDescription.trim(),
          measurements: measurements.trim(),
          material: material.trim(),
          shippingInfo: shippingInfo.trim(),
          notice: notice.trim(),
          detailImageUrls,
          createdAt: serverTimestamp(),
        });
        setFormSuccess("새로운 상품이 드롭 카탈로그에 등록되었습니다!");
        // Reset fields
        setName("");
        setPrice(0);
        setSize("");
        setDescription("");
        setImageUrl("");
        setIsSoldOut(false);
        setIsRecommended(false);
        setDetailDescription("");
        setMeasurements("");
        setMaterial("");
        setShippingInfo("");
        setNotice("");
        setDetailImageUrls([]);
        setTempProductId("");
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setProductSaving(false);
    }
  };

  // Delete product card
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("정말로 이 피스를 삭제하시겠습니까? 수집 정보가 영구 파기됩니다.")) return;
    const path = "products";
    try {
      await deleteDoc(doc(db, path, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
    }
  };

  // Submits a staff reply thread
  const handleReplySubmit = async (inqId: string) => {
    const text = replyTextMap[inqId];
    if (!text || !text.trim()) return;

    setReplySubmitting((prev) => ({ ...prev, [inqId]: true }));
    const path = "inquiries";

    try {
      const inqRef = doc(db, path, inqId);
      await updateDoc(inqRef, {
        reply: text.trim(),
      });
      // Clear local input
      setReplyTextMap((prev) => ({ ...prev, [inqId]: "" }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${path}/${inqId}`);
    } finally {
      setReplySubmitting((prev) => ({ ...prev, [inqId]: false }));
    }
  };

  // Seeds 6 beautifully configured responsive clothing entities in code
  const handleSeedProducts = async () => {
    if (!window.confirm("디오도어가 자랑하는 6종 프리미엄 가을 아카이브 기본 세일즈 데이터를 복사 등록하시겠습니까?")) return;
    const path = "products";
    try {
      for (const p of DEFAULT_PRODUCTS) {
        await setDoc(doc(db, path, p.id), {
          name: p.name,
          price: p.price,
          category: p.category,
          size: p.size,
          condition: p.condition,
          description: p.description,
          imageUrl: p.imageUrl,
          isSoldOut: p.isSoldOut,
          isRecommended: p.isRecommended,
          createdAt: serverTimestamp(),
        });
      }
      alert("성공적으로 상품 카탈로그에 데모 데이터 6종이 시딩되었습니다!");
    } catch (error) {
      console.error("Failed seeding:", error);
      alert("시딩 오류가 발생했습니다. 권한 및 규칙 적용을 검토하십시오.");
    }
  };

  const handleSeedStoreSettings = async () => {
    const path = "siteSettings";
    try {
      await setDoc(doc(db, path, "main"), {
        heroImageUrl: DEFAULT_SETTINGS.heroImageUrl,
        noticeTitle: DEFAULT_SETTINGS.noticeTitle,
        noticeText: DEFAULT_SETTINGS.noticeText,
        instagramUrl: DEFAULT_SETTINGS.instagramUrl,
        contactUrl: DEFAULT_SETTINGS.contactUrl,
        eventTitle: DEFAULT_SETTINGS.eventTitle || "",
        eventText: DEFAULT_SETTINGS.eventText || "",
        eventLink: DEFAULT_SETTINGS.eventLink || "",
        eventBadge: DEFAULT_SETTINGS.eventBadge || "",
        isEventActive: DEFAULT_SETTINGS.isEventActive ?? false,
      });
      alert("사이트 세팅 기본 템플릿이 활성화되었습니다!");
      // reload
      setHeroImg(DEFAULT_SETTINGS.heroImageUrl);
      setNoticeTitle(DEFAULT_SETTINGS.noticeTitle);
      setNoticeText(DEFAULT_SETTINGS.noticeText);
      setInstaUrl(DEFAULT_SETTINGS.instagramUrl);
      setContactUrl(DEFAULT_SETTINGS.contactUrl);
      setEventTitle(DEFAULT_SETTINGS.eventTitle || "");
      setEventText(DEFAULT_SETTINGS.eventText || "");
      setEventLink(DEFAULT_SETTINGS.eventLink || "");
      setEventBadge(DEFAULT_SETTINGS.eventBadge || "");
      setIsEventActive(DEFAULT_SETTINGS.isEventActive ?? false);
    } catch (error) {
      console.error("Failed settings seeding:", error);
    }
  };

  const handleSeedMoodCards = async () => {
    if (!isAdmin) {
      alert("관리자 권한이 없습니다.");
      return;
    }
    if (!window.confirm("6개의 기본 무드 카드를 Firestore에 등록하시겠습니까?")) return;
    const path = "moodCards";
    try {
      for (const card of DEFAULT_MOOD_CARDS) {
        await setDoc(doc(db, path, card.id), {
          title: card.title || "",
          tags: card.tags || "",
          imageUrl: card.imageUrl || "",
          linkUrl: card.linkUrl || "",
          order: Number(card.order) || 1,
          isActive: card.isActive !== false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      alert("성공적으로 무드 카드 데이터 6종이 시딩되었습니다!");
    } catch (error) {
      const errCode = (error as any)?.code || "unknown";
      const errMsg = (error as any)?.message || "";
      console.error("Failed seeding mood cards: Code =", errCode, "Message =", errMsg, error);
      alert("DB 저장 실패: [" + errCode + "]");
    }
  };

  const startEditMood = (card: MoodCard) => {
    setEditingMood(card);
    setMoodTitle(card.title || "");
    setMoodTags(card.tags || "");
    setMoodImageUrl(card.imageUrl || "");
    setMoodLinkUrl(card.linkUrl || "");
    setMoodOrder(card.order || 1);
    setMoodIsActive(card.isActive !== false);
    setMoodFormErr("");
    setMoodFormSuccess("");
  };

  const cancelEditMood = () => {
    setEditingMood(null);
    setMoodTitle("");
    setMoodTags("");
    setMoodImageUrl("");
    setMoodLinkUrl("");
    setMoodOrder(1);
    setMoodIsActive(true);
    setMoodFormErr("");
    setMoodFormSuccess("");
  };

  const handleSaveMoodCard = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving mood card. Current user email:", user?.email);

    if (!isAdmin) {
      setMoodFormErr("관리자 권한이 없습니다.");
      alert("관리자 권한이 없습니다.");
      return;
    }
    if (!moodTitle.trim() || !moodImageUrl.trim()) {
      setMoodFormErr("제목과 이미지는 필수 항목입니다.");
      return;
    }

    setMoodSaving(true);
    setMoodFormErr("");
    setMoodFormSuccess("");

    const path = "moodCards";

    try {
      const isNew = !editingMood;
      const cardId = editingMood ? editingMood.id : `mood_${Date.now()}`;
      const cardRef = doc(db, path, cardId);

      const payload: any = {
        title: moodTitle.trim() || "",
        tags: moodTags.trim() || "",
        imageUrl: moodImageUrl.trim() || "",
        linkUrl: moodLinkUrl.trim() || "",
        order: Number(moodOrder) || 1,
        isActive: moodIsActive !== false,
        updatedAt: serverTimestamp(),
      };

      if (isNew) {
        payload.createdAt = serverTimestamp();
      }

      await setDoc(cardRef, payload, { merge: true });

      setMoodFormSuccess("Mood Card가 저장되었습니다.");
      alert("Mood Card가 저장되었습니다.");
      cancelEditMood();
    } catch (err) {
      const errCode = (err as any)?.code || "unknown";
      const errMsg = (err as any)?.message || "";
      console.error("Save mood card failed: Code =", errCode, "Message =", errMsg, err);
      setMoodFormErr("DB 저장 실패: [" + errCode + "]");
      alert("DB 저장 실패: [" + errCode + "]");
    } finally {
      setMoodSaving(false);
    }
  };

  const handleDeleteMoodCard = async (id: string) => {
    if (!isAdmin) {
      alert("관리자 권한이 없습니다.");
      return;
    }
    if (!window.confirm("정말로 이 무드 카드를 삭제하시겠습니까?")) return;
    const path = "moodCards";
    try {
      await deleteDoc(doc(db, path, id));
    } catch (err) {
      const errCode = (err as any)?.code || "unknown";
      const errMsg = (err as any)?.message || "";
      console.error("Delete mood card failed: Code =", errCode, "Message =", errMsg, err);
      alert("DB 저장 실패: [" + errCode + "]");
    }
  };

  const formattedPrice = (p: number) => {
    return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(p);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title & Seeds Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-200 pb-6 gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#1A3020] font-mono font-bold">Verified Shop Control</span>
          <h1 className="text-3xl font-serif text-[#2C302E]">Admin Dashboard</h1>
        </div>

        {/* Curation Quick Seed Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSeedStoreSettings}
            className="flex items-center space-x-1 border border-[#8C624E]/40 text-[#8C624E] hover:bg-[#8C624E]/5 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Init Settings Template</span>
          </button>
          <button
            onClick={handleSeedProducts}
            className="flex items-center space-x-1 bg-[#1A3020] hover:bg-[#2C302E] text-white px-3.5 py-1.5 text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Seed 6 Demo Products</span>
          </button>
          <button
            onClick={handleSeedMoodCards}
            className="flex items-center space-x-1 bg-[#8C624E] hover:bg-[#a67b66] text-white px-3.5 py-1.5 text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Seed 6 Mood Cards</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation panels */}
      <div className="flex border-b border-stone-200 gap-6">
        <button
          onClick={() => setActiveTab("products")}
          className={`pb-3 text-sm font-medium tracking-wide border-b-2 uppercase focus:outline-hidden ${
            activeTab === "products"
              ? "border-[#8C624E] text-[#8C624E]"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          Manage Catalogue ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("moodCards")}
          className={`pb-3 text-sm font-medium tracking-wide border-b-2 uppercase focus:outline-hidden ${
            activeTab === "moodCards"
              ? "border-[#8C624E] text-[#8C624E]"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          Mood Cards ({moodCards.length})
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-3 text-sm font-medium tracking-wide border-b-2 uppercase focus:outline-hidden ${
            activeTab === "settings"
              ? "border-[#8C624E] text-[#8C624E]"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          Site Settings
        </button>
        <button
          onClick={() => setActiveTab("inquiries")}
          className={`pb-3 text-sm font-medium tracking-wide border-b-2 uppercase focus:outline-hidden ${
            activeTab === "inquiries"
              ? "border-[#8C624E] text-[#8C624E]"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          Customer Inquiries ({allInquiries.length})
        </button>
      </div>

      {/* TAB 1: SITE SETTINGS */}
      {activeTab === "settings" && (
        <form onSubmit={handleSaveSettings} className="bg-[#FAF7F0] p-6 sm:p-10 border border-[#8C624E]/10 space-y-6 max-w-4xl rounded-xs shadow-2xs">
          <div className="border-b border-stone-300 pb-4">
            <h3 className="text-xl font-serif text-[#2C302E]">Main Layout and Announcement Banner</h3>
            <p className="text-xs text-stone-400 font-light mt-1">
              메인 비주얼 배너 이미지 및 메인 상단 공지사항, 매장 연락망 링크를 변경 편집합니다.
            </p>
          </div>

          <div className="space-y-4">
            {/* Hero Image upload / Direct URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 font-semibold font-mono block">
                  Main Hero Banner Upload
                </label>
                <div className="border border-dashed border-[#8C624E]/20 bg-white p-4 text-center rounded-xs flex flex-col justify-center items-center h-32 relative group">
                  <UploadCloud className="w-8 h-8 text-stone-300 group-hover:text-[#8C624E] transition-colors mb-2" />
                  <span className="text-xs text-stone-500 font-light">배너 사진 파일 올리기 (.jpg, .png)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "hero")}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 font-semibold font-mono block">
                  Hero Image URL (or paste direct URL)
                </label>
                <textarea
                  rows={4}
                  value={heroImg}
                  onChange={(e) => setHeroImg(e.target.value)}
                  className="w-full bg-white border border-[#8C624E]/10 rounded-xs py-2 px-3 text-xs focus:outline-hidden font-mono h-32 resize-none"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>

            {/* Notice Title */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 font-semibold font-mono block">
                Announcement Title (공지 제목)
              </label>
              <input
                type="text"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                className="w-full bg-white border border-[#8C624E]/10 rounded-xs py-2.5 px-4 text-sm focus:outline-hidden focus:border-[#8C624E]"
                placeholder="6월 신제품 릴리즈 일람..."
              />
            </div>

            {/* Notice Text */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 font-semibold font-mono block">
                Announcement Detail Content (공지 상세 정보)
              </label>
              <textarea
                rows={5}
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                className="w-full bg-white border border-[#8C624E]/10 rounded-xs py-2.5 px-4 text-sm focus:outline-hidden focus:border-[#8C624E] resize-none"
                placeholder="공지 사항에 띄울 깊이 있는 세부 사항 정보를 기술해 주십시오."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Instagram URL */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 font-semibold font-mono block">
                  Instagram Link URL
                </label>
                <input
                  type="text"
                  value={instaUrl}
                  onChange={(e) => setInstaUrl(e.target.value)}
                  className="w-full bg-white border border-[#8C624E]/10 rounded-xs py-2.5 px-4 text-sm focus:outline-hidden focus:border-[#8C624E] font-mono text-xs"
                  placeholder="https://instagram.com/..."
                />
              </div>
              {/* Contact Link URL */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 font-semibold font-mono block">
                  Buying Inquiry Mail / Contact URL
                </label>
                <input
                  type="text"
                  value={contactUrl}
                  onChange={(e) => setContactUrl(e.target.value)}
                  className="w-full bg-white border border-[#8C624E]/10 rounded-xs py-2.5 px-4 text-sm focus:outline-hidden focus:border-[#8C624E] font-mono text-xs"
                  placeholder="mailto:jongminsin81@gmail.com"
                />
              </div>
            </div>

            {/* Event Slot Configuration */}
            <div className="border-t border-[#8C624E]/10 pt-6 mt-4 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C624E] font-mono">
                Event Slot Setting (이벤트 슬롯 설정)
              </h4>
              
              <div className="flex items-center space-x-2.5 bg-stone-50 p-4 border border-stone-200/50 rounded-xs">
                <input
                  type="checkbox"
                  id="isEventActive"
                  checked={isEventActive}
                  onChange={(e) => setIsEventActive(e.target.checked)}
                  className="w-4 h-4 text-[#8C624E] focus:ring-[#8C624E] border-[#8C624E]/20 rounded-xs"
                />
                <label htmlFor="isEventActive" className="text-xs font-semibold text-[#2C302E] tracking-wide select-none cursor-pointer">
                  Activate Event Slot Banner on Main Screen (메인 화면에 이벤트 슬롯 노출)
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Event Badge */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 font-semibold font-mono block">
                    Event Badge (배지 라벨)
                  </label>
                  <input
                    type="text"
                    value={eventBadge}
                    onChange={(e) => setEventBadge(e.target.value)}
                    className="w-full bg-white border border-[#8C624E]/10 rounded-xs py-2.5 px-4 text-sm focus:outline-hidden focus:border-[#8C624E]"
                    placeholder="e.g. EVENT, SEASON OFF, SPECIAL GIFT"
                  />
                </div>

                {/* Event Link */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 font-semibold font-mono block">
                    Event Target Link URL (이벤트 클릭 시 연결 링크)
                  </label>
                  <input
                    type="text"
                    value={eventLink}
                    onChange={(e) => setEventLink(e.target.value)}
                    className="w-full bg-white border border-[#8C624E]/10 rounded-xs py-2.5 px-4 text-sm focus:outline-hidden focus:border-[#8C624E] font-mono text-xs"
                    placeholder="이벤트 클릭 시 연결될 URL (Optional)"
                  />
                </div>
              </div>

              {/* Event Title */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 font-semibold font-mono block">
                  Event Slot Headline (이벤트 타이틀 대제목)
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full bg-white border border-[#8C624E]/10 rounded-xs py-2.5 px-4 text-sm focus:outline-hidden focus:border-[#8C624E]"
                  placeholder="e.g. 릴리즈 기념 전 품목 10% 추가 릴리즈 위크 돌입!"
                />
              </div>

              {/* Event Text */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 font-semibold font-mono block">
                  Event Subtext / Promo Detail (이벤트 부제목 및 설명글)
                </label>
                <textarea
                  rows={2}
                  value={eventText}
                  onChange={(e) => setEventText(e.target.value)}
                  className="w-full bg-white border border-[#8C624E]/10 rounded-xs py-2.5 px-4 text-sm focus:outline-hidden focus:border-[#8C624E] resize-none"
                  placeholder="진행 중인 혜택이나 배송 특이사항 등 상세 이벤트 설명을 적어주세요."
                />
              </div>
            </div>

            {/* Upload message reports */}
            {uploadingFile && (
              <p className="text-xs text-stone-500 animate-pulse flex items-center space-x-1 font-mono">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8C624E]" />
                <span>Media file is synchronizing with Firebase Storage...</span>
              </p>
            )}
            {uploadError && <p className="text-xs text-red-700 font-mono">{uploadError}</p>}
            {uploadSuccess && <p className="text-xs text-emerald-700 font-mono">{uploadSuccess}</p>}
          </div>

          <div className="max-w-xs pt-4">
            <button
              type="submit"
              disabled={settingsSaving || uploadingFile}
              className="w-full bg-[#1A3020] text-white hover:bg-[#2C302E] transition-colors py-3 text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-1.5 rounded-xs"
            >
              <span>{settingsSaving ? "Updating Settigs..." : "Deploy New Design Settings"}</span>
            </button>
          </div>

          {settingsSuccess && (
            <div className="bg-[#2D4236] text-[#FAF7F0] text-xs text-center py-2.5 font-mono tracking-wide rounded-sm border border-[#2D4236]/15 animate-fade-in">
              Site Settings has updated successfully on live Cloud Firestore database!
            </div>
          )}
        </form>
      )}

      {/* TAB 2: PRODUCTS CATALOG */}
      {activeTab === "products" && (
        <div className="space-y-12">
          
          {/* Create/Edit Form Container */}
          <form onSubmit={handleSaveProduct} className="bg-[#FAF7F0] p-6 sm:p-8 border border-[#8C624E]/10 grid grid-cols-1 md:grid-cols-3 gap-6 rounded-xs shadow-2xs">
            <div className="md:col-span-3 border-b border-stone-200 pb-3 flex justify-between items-center">
              <h3 className="text-lg font-serif text-[#2C302E] font-bold">
                {editingProduct ? "Modify Product details" : "Add New Unique Pieces"}
              </h3>
              {editingProduct && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-[#FAF7F0] border border-transparent hover:border-stone-200 transition-all focus:outline-hidden"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-4 md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 font-semibold font-mono block">
                    Product Title / 품명
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-[#8C624E]/10 rounded-xs py-2 px-3.5 text-sm focus:outline-hidden"
                    placeholder="Classic Suede Jacket"
                  />
                </div>
                {/* Price in KRW */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 font-semibold font-mono block">
                    Collection Price / 정산가 (KRW)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-white border border-[#8C624E]/10 rounded-xs py-2 px-3.5 text-sm focus:outline-hidden"
                    placeholder="89000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 font-semibold font-mono block">
                    Category Group
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-[#8C624E]/10 rounded-xs py-2 px-3.5 text-sm focus:ring-0 focus:outline-hidden cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Size */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 font-semibold font-mono block">
                    Tagged Sizes (S / M / L / Free)
                  </label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full bg-white border border-[#8C624E]/10 rounded-xs py-2 px-3.5 text-sm focus:outline-hidden"
                    placeholder="M"
                  />
                </div>
                {/* Condition */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 font-semibold font-mono block">
                    Vintage Condition Rating
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full bg-white border border-[#8C624E]/10 rounded-xs py-2 px-3.5 text-sm focus:ring-0 focus:outline-hidden cursor-pointer"
                  >
                    {conditions.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 font-semibold font-mono block">
                  Detailed Descriptions (Measurements & Materials)
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-[#8C624E]/10 rounded-xs py-2 px-4 text-sm focus:outline-hidden resize-none"
                  placeholder="스펙 치수실측이나 섬유 가이드라인을 기입해주십시오."
                />
              </div>
            </div>

            {/* Media Upload Side Grid */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 font-semibold font-mono block">
                  Product Image upload (Storage)
                </label>
                <div className="border border-dashed border-[#8C624E]/15 bg-white p-4 h-32 rounded-xs flex flex-col justify-center items-center text-center relative group">
                  <UploadCloud className="w-8 h-8 text-stone-300 group-hover:text-[#8C624E] transition-colors mb-2" />
                  <span className="text-xs text-stone-500 font-light font-sans">Click to upload file</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "product")}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 font-semibold font-mono block">
                  Or Image URL directly (Paste URL)
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-white border border-[#8C624E]/10 rounded-xs py-2 px-3 text-xs font-mono focus:outline-hidden"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              {/* Checks */}
              <div className="flex flex-col gap-2 pt-1">
                <label className="flex items-center space-x-3 text-xs text-stone-600 font-light cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSoldOut}
                    onChange={(e) => setIsSoldOut(e.target.checked)}
                    className="rounded-xs border-stone-300 text-[#8C624E]"
                  />
                  <span>Is Sold Out (품절 처리)</span>
                </label>
                <label className="flex items-center space-x-3 text-xs text-stone-600 font-light cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecommended}
                    onChange={(e) => setIsRecommended(e.target.checked)}
                    className="rounded-xs border-stone-300 text-[#1A3020]"
                  />
                  <span>Recommend Topic (추천 상품)</span>
                </label>
              </div>
            </div>

            {/* 추가 디테일 필드 */}
            <div className="md:col-span-3 border-t border-[#8C624E]/10 pt-6 mt-4 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C624E] font-mono">
                상세 페이지 추가 정보 (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 font-semibold font-mono block">
                    상세 설명 (detailDescription)
                  </label>
                  <textarea
                    rows={3}
                    value={detailDescription}
                    onChange={(e) => setDetailDescription(e.target.value)}
                    className="w-full bg-white border border-[#8C624E]/10 rounded-xs py-2 px-3 text-sm focus:outline-hidden"
                    placeholder="제품의 세부 소재감, 디테일, 핏 등 상세 설명을 입력해 주세요."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 font-semibold font-mono block">
                    실측 사이즈 (measurements)
                  </label>
                  <textarea
                    rows={3}
                    value={measurements}
                    onChange={(e) => setMeasurements(e.target.value)}
                    className="w-full bg-white border border-[#8C624E]/10 rounded-xs py-2 px-3 text-sm focus:outline-hidden"
                    placeholder="어깨, 가슴, 소매, 총장 등 구체적인 실측 사이즈를 입력해 주세요."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 font-semibold font-mono block">
                    소재 (material)
                  </label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full bg-white border border-[#8C624E]/10 rounded-xs py-2 px-3 text-sm focus:outline-hidden"
                    placeholder="울 100%, 면 100% 등"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 font-semibold font-mono block">
                    배송 안내 (shippingInfo)
                  </label>
                  <input
                    type="text"
                    value={shippingInfo}
                    onChange={(e) => setShippingInfo(e.target.value)}
                    className="w-full bg-white border border-[#8C624E]/10 rounded-xs py-2 px-3 text-sm focus:outline-hidden"
                    placeholder="기본값: 전국 무료 배송 (우체국택배)"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 font-semibold font-mono block">
                    구매 전 안내 (notice)
                  </label>
                  <input
                    type="text"
                    value={notice}
                    onChange={(e) => setNotice(e.target.value)}
                    className="w-full bg-white border border-[#8C624E]/10 rounded-xs py-2 px-3 text-sm focus:outline-hidden"
                    placeholder="교환/환불 불가 안내 등"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#2C302E]/60 font-semibold font-mono block">
                  상세 이미지 여러 장 (Firebase Storage 업로드)
                </label>
                <div className="border border-dashed border-[#8C624E]/15 bg-white p-4 rounded-xs min-h-24 flex flex-col justify-center items-center text-center relative group">
                  {uploadingDetailFiles ? (
                    <div className="flex items-center space-x-2 text-stone-500 text-xs">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#8C624E]" />
                      <span>상세 이미지를 Firebase Storage에 업로드 중...</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-stone-300 group-hover:text-[#8C624E] transition-colors mb-2" />
                      <span className="text-xs text-stone-500 font-light font-sans">여러 이미지 선택하기 (클릭하여 업로드)</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleDetailImagesUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </>
                  )}
                </div>
                {detailImageUrls.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] uppercase tracking-widest text-[#2C302E]/40 font-semibold font-mono mb-2">
                      업로드된 상세 이미지 ({detailImageUrls.length})
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                      {detailImageUrls.map((url, idx) => (
                        <div key={idx} className="relative aspect-square border border-stone-200 group/img">
                          <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => setDetailImageUrls(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white rounded-full p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error notifications and buttons */}
            <div className="md:col-span-3 pt-3 flex flex-col gap-3 justify-end items-stretch sm:flex-row sm:items-center">
              
              {formErr && (
                <div className="mr-auto text-xs text-red-700 bg-red-100/50 px-4 py-2 border border-red-200/50 flex items-center space-x-1.5 font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formErr}</span>
                </div>
              )}
              {formSuccess && (
                <div className="mr-auto text-xs text-emerald-700 bg-emerald-100/50 px-4 py-2 border border-emerald-200/50 flex items-center space-x-1.5 font-mono">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div className="flex gap-4">
                {editingProduct && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="border border-stone-300 px-6 py-3 text-xs tracking-widest text-stone-700 uppercase rounded-xs font-semibold hover:bg-stone-100 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={productSaving || uploadingFile}
                  className="bg-[#1A3020] hover:bg-[#2C302E] text-white px-8 py-3 text-xs tracking-widest uppercase font-semibold flex items-center justify-center space-x-1 border border-[#1A3020] rounded-xs transition-colors cursor-pointer"
                >
                  <span>{productSaving ? "Saving details..." : editingProduct ? "Apply Changes" : "Publish to Shop"}</span>
                </button>
              </div>
            </div>
          </form>

          {/* List of existing products with action handlers */}
          <div className="border border-stone-200/80 rounded-xs overflow-hidden">
            <div className="bg-[#FAF7F0] px-6 py-4 border-b border-stone-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700">Existing Pieces List</h3>
            </div>

            {products.length === 0 ? (
              <p className="text-center py-10 text-xs text-stone-400 font-light">
                No items in catalogue database yet. Fill out the form above or click 'Seed Default Data' to populate.
              </p>
            ) : (
              <div className="divide-y divide-stone-200/60 font-mono">
                {products.map((p) => (
                  <div key={p.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 gap-4 hover:bg-stone-10/50 transition-colors">
                    <div className="flex items-center space-x-4 min-w-0 flex-1">
                      <div className="w-12 h-16 bg-stone-100 border border-stone-200/40 shrink-0 overflow-hidden rounded-xs">
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-stone-800 truncate font-serif">{p.name}</h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] text-stone-500 font-light">
                          <span>{p.category}</span>
                          <span>&middot;</span>
                          <span>Size {p.size}</span>
                          <span>&middot;</span>
                          <span className="text-[#8C624E] font-semibold">{formattedPrice(p.price)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status signals and actions */}
                    <div className="flex items-center space-x-3 shrink-0 flex-wrap gap-y-2">
                      <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-medium ${p.isSoldOut ? "bg-stone-200 text-stone-500" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>
                        {p.isSoldOut ? "Sold Out" : "In Stock"}
                      </span>
                      {p.isRecommended && (
                        <span className="text-[9px] uppercase bg-amber-50 text-amber-800 border border-amber-100 px-2 py-0.5 rounded-sm flex items-center space-x-0.5 font-medium">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>Choiced</span>
                        </span>
                      )}
                      
                      <div className="w-px h-6 bg-stone-300 hidden sm:block" />

                      <button
                        onClick={() => startEditProduct(p)}
                        className="p-2 border border-stone-200 text-stone-600 hover:text-[#8C624E] hover:bg-[#8C624E]/5 rounded-sm transition-colors cursor-pointer"
                        title="편집"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-2 border border-stone-200 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: CUSTOMER INQUIRIES LIST / MANAGER */}
      {activeTab === "inquiries" && (
        <div className="space-y-6">
          <div className="border-b border-stone-200 pb-3">
            <h3 className="text-xl font-serif text-[#2C302E]">Customer Inquiries Management</h3>
            <p className="text-xs text-stone-400 font-light mt-1">
              상점 가입 회원들의 문의사항을 읽고 답변을 작성합니다. 등록된 글은 사용자의 마이페이지에 실시간 게시됩니다.
            </p>
          </div>

          {loadingInqs ? (
            <p className="text-sm text-stone-500 animate-pulse leading-6">Loading client inquiries list...</p>
          ) : allInquiries.length === 0 ? (
            <div className="text-center py-20 border border-stone-200/50 bg-[#FAF7F0]/30 space-y-4">
              <MessageSquare className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-xs text-stone-400 font-light">등록된 고객 문의가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {allInquiries.map((inq) => {
                const inqReply = inq.reply;
                const isRepSubmitting = replySubmitting[inq.id] || false;
                return (
                  <div key={inq.id} className="bg-[#FAF7F0] p-6 sm:p-8 border border-[#8C624E]/10 rounded-sm space-y-4 shadow-3xs">
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="space-y-1">
                        {inq.productName && (
                          <span className="text-[10px] uppercase font-mono tracking-widest bg-stone-200 text-stone-700 px-2.5 py-0.5 rounded-sm">
                            Product Link: {inq.productName} (ID: {inq.productId})
                          </span>
                        )}
                        <h4 className="text-base font-semibold text-[#2C302E] pt-1">{inq.title}</h4>
                        <div className="flex flex-wrap text-[10px] text-stone-400 font-mono gap-y-1 gap-x-4">
                          <span className="flex items-center text-stone-600">
                            <User className="w-3 h-3 mr-1" />
                            {inq.userName} ({inq.userEmail})
                          </span>
                          <span>&middot;</span>
                          <span>Registered: {new Date(inq.createdAt as any).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm ${inqReply ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800 border border-amber-200/50 animate-pulse"}`}>
                        {inqReply ? "Answered" : "Active / Unanswered"}
                      </span>
                    </div>

                    <p className="text-xs text-stone-700 bg-white p-4 rounded-xs border border-stone-200/60 whitespace-pre-line leading-relaxed font-light">
                      {inq.message}
                    </p>

                    {/* Has answer thread */}
                    {inqReply && (
                      <div className="bg-[#2D4236]/5 p-4 border border-[#2D4236]/10 rounded-xs space-y-1">
                        <p className="text-xs font-semibold text-[#1A3020] uppercase font-mono flex items-center space-x-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Submitted Reply Content:</span>
                        </p>
                        <p className="text-xs text-stone-600 font-light whitespace-pre-line leading-relaxed pl-1.5 border-l-2 border-[#1A3020]/20">
                          {inqReply}
                        </p>
                      </div>
                    )}

                    {/* Reply formulation field */}
                    <div className="space-y-2 pt-2 border-t border-stone-200">
                      <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block">
                        {inqReply ? "Overwite / Edit Answer" : "Compose Answer (답변 입력)"}
                      </label>
                      <textarea
                        rows={3}
                        value={replyTextMap[inq.id] || ""}
                        onChange={(e) => setReplyTextMap((prev) => ({ ...prev, [inq.id]: e.target.value }))}
                        className="w-full bg-white border border-[#8C624E]/10 rounded-xs py-2.5 px-4 text-xs focus:outline-hidden"
                        placeholder="고객께 발송할 세부적인 답변 내용을 작성하여 게시하십시오."
                      />
                      <button
                        onClick={() => handleReplySubmit(inq.id)}
                        disabled={isRepSubmitting || !replyTextMap[inq.id]?.trim()}
                        className="bg-[#2D4236] hover:bg-[#1A3020] text-white disabled:bg-stone-300 disabled:text-stone-500 disabled:cursor-not-allowed text-[10px] uppercase tracking-widest font-semibold px-4 py-2 rounded-xs transition-colors cursor-pointer"
                      >
                        {isRepSubmitting ? "Publishing reply..." : "Publish Staff Answer"}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MOOD CARDS */}
      {activeTab === "moodCards" && (
        <div className="space-y-12 animate-fade-in">
          <div className="border-b border-stone-200 pb-3">
            <h3 className="text-xl font-serif text-[#2C302E]">Mood Cards Management</h3>
            <p className="text-xs text-stone-400 font-light mt-1">
              홈페이지의 Mood Card / Instagram Archive 섹션에 표시될 이미지 카드를 직접 추가하고 관리합니다.
            </p>
          </div>

          <div id="mood-tab-split-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Col: Add/Edit Form */}
            <div className="lg:col-span-1">
              <form onSubmit={handleSaveMoodCard} className="bg-[#FAF7F0] p-6 border border-[#8C624E]/10 rounded-xs space-y-4 shadow-3xs">
                <h4 className="text-sm uppercase tracking-widest text-[#8C624E] font-medium border-b border-stone-200 pb-2">
                  {editingMood ? "Edit Mood Card" : "Create Mood Card"}
                </h4>

                {moodFormErr && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs flex items-center space-x-2 rounded-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{moodFormErr}</span>
                  </div>
                )}
                {moodFormSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2 rounded-xs">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span>{moodFormSuccess}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-stone-500 block">Title (제목)</label>
                  <input
                    type="text"
                    value={moodTitle}
                    onChange={(e) => setMoodTitle(e.target.value)}
                    className="w-full bg-white border border-[#8C624E]/15 rounded-xs px-3 py-2 text-xs focus:outline-[#8C624E]/30"
                    placeholder="e.g., Warm Autumn Curation"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-stone-500 block">Tags (태그)</label>
                  <input
                    type="text"
                    value={moodTags}
                    onChange={(e) => setMoodTags(e.target.value)}
                    className="w-full bg-white border border-[#8C624E]/15 rounded-xs px-3 py-2 text-xs focus:outline-[#8C624E]/30"
                    placeholder="e.g., #vintage #autumn"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-stone-500 block">Link URL</label>
                  <input
                    type="text"
                    value={moodLinkUrl}
                    onChange={(e) => setMoodLinkUrl(e.target.value)}
                    className="w-full bg-white border border-[#8C624E]/15 rounded-xs px-3 py-2 text-xs focus:outline-[#8C624E]/30"
                    placeholder="https://instagram.com/p/..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-stone-500 block">Display Order</label>
                    <input
                      type="number"
                      value={moodOrder}
                      onChange={(e) => setMoodOrder(Number(e.target.value))}
                      className="w-full bg-white border border-[#8C624E]/15 rounded-xs px-3 py-2 text-xs focus:outline-[#8C624E]/30"
                      min={1}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-stone-500 block">Status (노출 여부)</label>
                    <select
                      value={moodIsActive ? "true" : "false"}
                      onChange={(e) => setMoodIsActive(e.target.value === "true")}
                      className="w-full bg-white border border-[#8C624E]/15 rounded-xs px-3 py-2 text-xs focus:outline-[#8C624E]/30"
                    >
                      <option value="true">Active (노출)</option>
                      <option value="false">Hidden (비노출)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-stone-500 block">Upload Card Image (Storage)</label>
                  <div className="border-2 border-dashed border-[#8C624E]/20 hover:border-[#8C624E]/50 rounded-xs p-4 text-center transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "moodCards")}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                      disabled={!isAdmin || uploadingFile}
                    />
                    <div className="space-y-1 text-stone-500">
                      <UploadCloud className="w-6 h-6 mx-auto text-[#8C624E]/60" />
                      <p className="text-[10px] font-sans">클릭하여 이미지 파일을 선택하세요</p>
                      <p className="text-[9px] font-mono text-stone-400">Path: moodCards/</p>
                    </div>
                  </div>
                  {uploadingFile && (
                    <p className="text-[10px] text-amber-600 animate-pulse font-mono flex items-center justify-center space-x-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading to Storage...</span>
                    </p>
                  )}
                  {moodImageUrl && (
                    <div className="relative mt-2 p-1 border border-stone-200 bg-white rounded-xs">
                      <img src={moodImageUrl} alt="Preview" className="w-full aspect-square object-cover rounded-xs font-serif" referrerPolicy="no-referrer" />
                      <p className="text-[9px] text-stone-400 truncate mt-1 font-mono">{moodImageUrl}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={!isAdmin || moodSaving || uploadingFile}
                    className="flex-1 bg-[#1A3020] text-white py-2 text-xs uppercase tracking-widest font-semibold hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {!isAdmin ? "Admin Only" : moodSaving ? "Saving..." : editingMood ? "Update Card" : "Add Card"}
                  </button>
                  {editingMood && (
                    <button
                      type="button"
                      onClick={cancelEditMood}
                      className="bg-stone-200 text-stone-700 px-3 py-2 text-xs uppercase tracking-wider font-semibold hover:bg-stone-300 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Right Col: Active Feed List with Actions */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-sm uppercase tracking-widest text-[#2C302E] font-bold mb-2 border-b border-stone-200 pb-2">
                Card Grid Archive ({moodCards.length})
              </h4>

              {moodCards.length === 0 ? (
                <div className="text-center py-24 bg-white border border-stone-200/50 rounded-xs space-y-4">
                  <AlertCircle className="w-8 h-8 text-stone-300 mx-auto" />
                  <p className="text-xs text-stone-400 font-light">등록된 무드 카드가 없습니다.<br />우측 상단의 시드 버튼을 클릭하시어 기본형 데이터 6종을 초기 수집하고 이용하세요.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {moodCards.map((card) => (
                    <div
                      key={card.id}
                      className={`group relative bg-white border rounded-xs shadow-xs overflow-hidden transition-all duration-300 ${
                        card.isActive ? "border-[#8C624E]/15" : "border-stone-200 opacity-60"
                      }`}
                    >
                      <div className="aspect-square bg-stone-100 overflow-hidden relative">
                        <img
                          src={card.imageUrl || IMG_PLACEHOLDER}
                          alt={card.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        {!card.isActive && (
                          <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center">
                            <span className="text-[10px] font-mono tracking-widest uppercase text-white font-bold bg-stone-800/80 px-2 py-0.5 rounded-xs">
                              Hidden
                            </span>
                          </div>
                        )}
                        <div className="absolute top-2 left-2 bg-stone-900/80 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-sm">
                          Order: {card.order || 1}
                        </div>
                      </div>

                      <div className="p-3.5 space-y-1">
                        <h5 className="text-xs font-semibold text-[#2C302E] truncate">{card.title}</h5>
                        <p className="text-[10px] font-mono text-[#8C624E] truncate">{card.tags || "No tags"}</p>
                        <p className="text-[9px] text-stone-400 truncate" title={card.linkUrl}>
                          Link: {card.linkUrl ? card.linkUrl : "None"}
                        </p>
                      </div>

                      <div className="absolute bottom-2 right-2 flex gap-1 bg-white/95 p-1 rounded-xs border border-stone-200/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => startEditMood(card)}
                          className="p-1 hover:bg-stone-100 text-stone-600 hover:text-[#8C624E]"
                          title="Edit Card"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMoodCard(card.id)}
                          className="p-1 hover:bg-stone-100 text-stone-600 hover:text-red-500"
                          title="Delete Card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
