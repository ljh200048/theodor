/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, SiteSetting } from "./types";

export const DEFAULT_SETTINGS: SiteSetting = {
  heroImageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
  noticeTitle: "theodor_vintage 릴리즈 및 배송 안내",
  noticeText: "모든 패브릭 빈티지 상품은 정밀 세탁 및 고온 스팀 살균 처리가 완료된 후 정성스레 배송됩니다. 수량이 오직 하나뿐인 빈티지 편집 특성상, 장바구니에 담아두시더라도 결제 완료 선착순으로 완판되오니 이 점 유의 부탁드립니다. 신규 회원 가입 후 입금 시 무료 배송 혜택을 드립니다.",
  instagramUrl: "https://instagram.com/theodor_vintage",
  contactUrl: "mailto:lch200048@gmail.com"
};

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "default_prod_1",
    name: "Summer Linen Daily Set-up",
    price: 89000,
    category: "Tops",
    size: "Free",
    condition: "S: Mint Condition",
    description: "쾌적하고 가벼운 100% 퓨어 린넨 재질로 제작된 빈티지 슬리브리스와 와이드 하프 팬츠 세트업 제품입니다. 샌들이나 부츠와 매치했을 때 가장 클래식하면서도 내추럴한 실루엣을 부각해 주는 실용적인 코디 상품입니다.",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
    isSoldOut: false,
    isRecommended: true,
    createdAt: new Date()
  },
  {
    id: "default_prod_2",
    name: "Cottage Green Checked Dress",
    price: 124000,
    category: "Dresses",
    size: "M",
    condition: "A: Excellent Vintage",
    description: "목가적인 무드를 연출해 주는 은은한 올리브 그린 컬러 계열의 타탄 체크 빈티지 드레스입니다. 핀턱 디테일과 빈티지 우드 버튼 마감이 특징이며, 가슴선의 셔링이 사랑스러운 볼륨을 완성해 줍니다.",
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
    isSoldOut: true,
    isRecommended: false,
    createdAt: new Date()
  },
  {
    id: "default_prod_3",
    name: "1994 Americana Lettering Tee",
    price: 38000,
    category: "Tops",
    size: "L",
    condition: "B: Nicely Faded Charm",
    description: "90년대 오리지널 아메리카나 프린트가 멋스럽게 에이징된 빈티지 그래픽 반팔 티셔츠입니다. 적당히 워싱된 크림 베이지 원단 톤과 묵직한 코튼 피트가 캐주얼한 무드를 선사하여 매력적인 포인트 아이템으로 제격입니다.",
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80",
    isSoldOut: false,
    isRecommended: false,
    createdAt: new Date()
  },
  {
    id: "default_prod_4",
    name: "Double Circle Pendant Necklace",
    price: 45000,
    category: "Accessories",
    size: "Onesize",
    condition: "S: Near Deadstock",
    description: "앤틱 실버 플레이티드 마감과 함께, 정교한 음각 디테일이 인상적인 더블 원형 펜던트 목걸이입니다. 과하지 않으면서도 미니멀한 이너 탑이나 셔츠 깃 사이에 클래식한 빈티지 악센트를 줍니다.",
    imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80",
    isSoldOut: false,
    isRecommended: true,
    createdAt: new Date()
  },
  {
    id: "default_prod_5",
    name: "Loose Linen Curation Blazer",
    price: 135000,
    category: "Outerwear",
    size: "Free",
    condition: "A: Great Condition",
    description: "오버핏 실루엣으로 편안하게 걸치기 좋은 라이트 베이지 에코 빈티지 린넨 블레이저 자켓입니다. 어깨 패드가 얇게 패딩 설계되어 흘러내림을 막아주고, 오피스 무드와 데일리 루즈 룩 모두 훌륭하게 소화 가능합니다.",
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",
    isSoldOut: false,
    isRecommended: true,
    createdAt: new Date()
  },
  {
    id: "default_prod_6",
    name: "Chunky Cognac Leather Boots",
    price: 189000,
    category: "Shoes",
    size: "245mm",
    condition: "A: Well Cared Leather",
    description: "클래식한 태닝 코냑 브라운 가죽 톤과 견고한 웰트 이중 마감이 완벽한 청키 통굽 레더 부츠입니다. 세월의 흐름에 따라 아름답게 유연해진 천연 소가죽의 자연스러운 텍스처와 에이징이 돋보입니다.",
    imageUrl: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&q=80",
    isSoldOut: false,
    isRecommended: true,
    createdAt: new Date()
  }
];
