import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { YandexLoginButton } from "@/components/extensions/yandex-auth/YandexLoginButton";
import { useYandexAuth } from "@/components/extensions/yandex-auth/useYandexAuth";

const YANDEX_AUTH_URL = "https://functions.poehali.dev/b9eb14dd-44e2-4b02-8e2d-842ae754f242";

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen = "landing" | "login" | "register" | "captcha" | "creating" | "shop" | "product" | "cart" | "settings" | "admin" | "checkout";

interface User {
  phone: string;
  email: string;
  password: string;
  isAdmin: boolean;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  category: string;
  emoji: string;
  specs: string[];
  badge?: string;
  rating: number;
  reviews: number;
}

interface CartItem {
  product: Product;
  qty: number;
}

interface AdminMessage {
  from: "admin" | "user";
  text: string;
  time: string;
}

// ─── Products Data ─────────────────────────────────────────────────────────────
const PRODUCTS: Product[] = [
  { id: 1, name: "iPhone 15 Pro Max 256GB", price: 119990, oldPrice: 134990, category: "Телефоны", emoji: "📱", badge: "Хит", rating: 4.9, reviews: 2341, specs: ["6.7\" Super Retina XDR", "Chip A17 Pro", "48 МП камера", "USB-C", "Titanium корпус"] },
  { id: 2, name: "Samsung Galaxy S24 Ultra", price: 109990, oldPrice: 124990, category: "Телефоны", emoji: "📱", badge: "Новинка", rating: 4.8, reviews: 1876, specs: ["6.8\" Dynamic AMOLED", "Snapdragon 8 Gen 3", "200 МП камера", "S Pen в комплекте", "5000 мАч"] },
  { id: 3, name: "Xiaomi 14 Pro 12/256GB", price: 74990, oldPrice: 89990, category: "Телефоны", emoji: "📱", rating: 4.7, reviews: 987, specs: ["6.73\" AMOLED 120Гц", "Snapdragon 8 Gen 3", "50 МП Leica камера", "120W зарядка"] },
  { id: 4, name: "Windows 10 Pro (лицензия)", price: 4990, oldPrice: 7990, category: "ПО", emoji: "💿", badge: "Скидка", rating: 4.6, reviews: 5432, specs: ["Бессрочная лицензия", "OEM ключ активации", "32/64-бит", "Электронная доставка"] },
  { id: 5, name: "Windows 11 Pro (лицензия)", price: 5990, oldPrice: 8990, category: "ПО", emoji: "💿", badge: "Новинка", rating: 4.5, reviews: 3211, specs: ["Бессрочная лицензия", "TPM 2.0 требуется", "64-бит", "Электронная доставка"] },
  { id: 6, name: "Windows 7 Ultimate (лицензия)", price: 1990, category: "ПО", emoji: "💿", rating: 4.3, reviews: 876, specs: ["Ретро лицензия", "32/64-бит", "Коллекционный ключ"] },
  { id: 7, name: "Windows 8.1 Pro (лицензия)", price: 2490, category: "ПО", emoji: "💿", rating: 4.0, reviews: 412, specs: ["Бессрочная лицензия", "32/64-бит", "Электронная доставка"] },
  { id: 8, name: "MacBook Air M3 15\" 8/256", price: 139990, oldPrice: 159990, category: "Ноутбуки", emoji: "💻", badge: "Топ", rating: 4.9, reviews: 1654, specs: ["M3 chip", "15.3\" Liquid Retina", "18ч батарея", "MagSafe 3", "Midnight"] },
  { id: 9, name: "ASUS ROG Zephyrus G14", price: 99990, oldPrice: 119990, category: "Ноутбуки", emoji: "💻", badge: "Игровой", rating: 4.8, reviews: 743, specs: ["AMD Ryzen 9 8945HS", "RTX 4070 8GB", "14\" QHD 165Гц", "32GB RAM"] },
  { id: 10, name: "Lenovo ThinkPad X1 Carbon", price: 124990, category: "Ноутбуки", emoji: "💻", rating: 4.7, reviews: 532, specs: ["Intel Core Ultra 7", "14\" IPS 2K", "SSD 512GB", "LTE модуль", "Карбоновый корпус"] },
  { id: 11, name: "iPad Pro 13\" M4 Wi-Fi 256GB", price: 109990, oldPrice: 129990, category: "Планшеты", emoji: "📟", badge: "Новинка", rating: 4.9, reviews: 876, specs: ["M4 chip", "13\" OLED Ultra Retina", "Apple Pencil Pro", "Nano-texture glass"] },
  { id: 12, name: "Sony WH-1000XM5", price: 29990, oldPrice: 37990, category: "Наушники", emoji: "🎧", badge: "Хит", rating: 4.8, reviews: 4321, specs: ["ANC шумодав", "30ч батарея", "Bluetooth 5.2", "LDAC", "Multipoint"] },
  { id: 13, name: "Apple Watch Series 9 45мм", price: 39990, oldPrice: 44990, category: "Умные часы", emoji: "⌚", rating: 4.8, reviews: 2109, specs: ["S9 SiP chip", "Always-On Retina", "ЭКГ + пульс", "60м водозащита"] },
  { id: 14, name: "Dyson V15 Detect Absolute", price: 54990, oldPrice: 64990, category: "Техника", emoji: "🔌", badge: "Топ", rating: 4.7, reviews: 1234, specs: ["HEPA фильтр", "60 мин работы", "Лазерный пылеобнаружитель", "7 насадок"] },
  { id: 15, name: "Realme GT 6T 8/256GB", price: 34990, oldPrice: 42990, category: "Телефоны", emoji: "📱", rating: 4.5, reviews: 654, specs: ["Snapdragon 7s Gen 3", "6.78\" AMOLED 120Гц", "50 МП камера", "120W зарядка"] },
  { id: 16, name: "SSD Samsung 970 EVO Plus 1TB", price: 8990, oldPrice: 11990, category: "Комплектующие", emoji: "💾", badge: "Скидка", rating: 4.9, reviews: 7865, specs: ["NVMe M.2", "3500 МБ/с чтение", "TLC V-NAND", "5 лет гарантия"] },
];

const CATEGORIES = ["Все", "Телефоны", "Ноутбуки", "ПО", "Планшеты", "Наушники", "Умные часы", "Техника", "Комплектующие"];

const LANDING_ITEMS = [
  { emoji: "📱", name: "iPhone 15 Pro", price: "119 990 ₽", delay: 0 },
  { emoji: "💻", name: "MacBook Air M3", price: "139 990 ₽", delay: 0.15 },
  { emoji: "💿", name: "Windows 11 Pro", price: "5 990 ₽", delay: 0.3 },
  { emoji: "🎧", name: "Sony WH-1000XM5", price: "29 990 ₽", delay: 0.45 },
  { emoji: "📟", name: "iPad Pro M4", price: "109 990 ₽", delay: 0.6 },
  { emoji: "⌚", name: "Apple Watch S9", price: "39 990 ₽", delay: 0.75 },
  { emoji: "💿", name: "Windows 10 Pro", price: "4 990 ₽", delay: 0.9 },
  { emoji: "💾", name: "SSD Samsung 1TB", price: "8 990 ₽", delay: 1.05 },
];

const PROMO_CODES: Record<string, string> = {
  "admibnw231kl": "admin",
  "VOLTDISCOUNT": "discount10",
};

const ADMIN_LOGS = [
  "[2026-06-12 14:32:01] Новый пользователь: user@mail.ru",
  "[2026-06-12 14:31:45] Заказ #4821 — iPhone 15 Pro Max, Адрес: ул. Ленина 12 кв 34",
  "[2026-06-12 14:30:12] Новый пользователь: test@test.com",
  "[2026-06-12 14:28:55] Заказ #4820 — MacBook Air M3, Samsung SSD",
  "[2026-06-12 14:25:01] Промокод admibnw231kl применён пользователем admin@volt.ru",
  "[2026-06-12 14:20:33] Добавлен товар: iPad Pro 13\" M4",
  "[2026-06-12 14:15:00] Запуск сервера VoltMall v1.0",
];

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Index() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(() => {
    try { return JSON.parse(localStorage.getItem("voltmall_users") || "[]"); } catch (_e) { return []; }
  });

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [creatingProgress, setCreatingProgress] = useState(0);

  const [category, setCategory] = useState("Все");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState("");

  const [checkoutAddress, setCheckoutAddress] = useState({ street: "", house: "", apt: "", floor: "", checkPhone: "" });
  const [checkoutDone, setCheckoutDone] = useState(false);

  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([
    { from: "admin", text: "Добро пожаловать в чат поддержки! Как могу помочь?", time: "14:30" }
  ]);
  const [adminInput, setAdminInput] = useState("");
  const [logsExpanded, setLogsExpanded] = useState(false);
  const logsRef = useRef<HTMLDivElement>(null);

  const yandexAuth = useYandexAuth({
    apiUrls: {
      authUrl: `${YANDEX_AUTH_URL}?action=auth-url`,
      callback: `${YANDEX_AUTH_URL}?action=callback`,
      refresh: `${YANDEX_AUTH_URL}?action=refresh`,
      logout: `${YANDEX_AUTH_URL}?action=logout`,
    },
  });

  useEffect(() => {
    const saved = localStorage.getItem("voltmall_current");
    if (saved) {
      try { setUser(JSON.parse(saved)); setScreen("shop"); } catch (_e) { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if (screen === "creating") {
      setCreatingProgress(0);
      const interval = setInterval(() => {
        setCreatingProgress(p => {
          if (p >= 100) { clearInterval(interval); setTimeout(() => setScreen("shop"), 300); return 100; }
          return p + 4;
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [screen]);

  const handleRegister = () => {
    setRegError("");
    if (!phone.match(/^[+7\d][\d\s\-(]{8,}/)) { setRegError("Введите корректный номер телефона"); return; }
    if (!email.includes("@")) { setRegError("Введите корректный email"); return; }
    if (password.length < 6) { setRegError("Пароль должен быть не менее 6 символов"); return; }
    setScreen("captcha");
  };

  const handleCaptcha = () => {
    if (!captchaChecked) return;
    const newUser: User = { phone, email, password, isAdmin: false, createdAt: new Date().toISOString() };
    const updated = [...users, newUser];
    setUsers(updated);
    setUser(newUser);
    localStorage.setItem("voltmall_users", JSON.stringify(updated));
    localStorage.setItem("voltmall_current", JSON.stringify(newUser));
    setScreen("creating");
  };

  const handleLogin = () => {
    setLoginError("");
    if (!loginEmail.includes("@")) { setLoginError("Введите корректный email"); return; }
    if (!loginPassword) { setLoginError("Введите пароль"); return; }
    const found = users.find(u => u.email === loginEmail && u.password === loginPassword);
    if (!found) { setLoginError("Неверный email или пароль"); return; }
    setUser(found);
    localStorage.setItem("voltmall_current", JSON.stringify(found));
    setLoginEmail(""); setLoginPassword(""); setLoginError("");
    setScreen("shop");
  };

  const handleLogout = async () => {
    await yandexAuth.logout();
    setUser(null);
    localStorage.removeItem("voltmall_current");
    setScreen("landing");
    setPhone(""); setEmail(""); setPassword("");
    setLoginEmail(""); setLoginPassword("");
  };

  const handlePromo = () => {
    const result = PROMO_CODES[promoCode.trim()];
    if (!result) { setPromoResult("❌ Промокод не найден"); return; }
    if (result === "admin" && user) {
      const updated = { ...user, isAdmin: true };
      setUser(updated);
      localStorage.setItem("voltmall_current", JSON.stringify(updated));
      const updatedUsers = users.map(u => u.email === user.email ? updated : u);
      setUsers(updatedUsers);
      localStorage.setItem("voltmall_users", JSON.stringify(updatedUsers));
      setPromoResult("✅ Получен статус Администратора!");
    } else if (result === "discount10") {
      setPromoResult("✅ Скидка 10% активирована!");
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeFromCart = (id: number) => setCart(prev => prev.filter(i => i.product.id !== id));
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);

  const filteredProducts = PRODUCTS.filter(p => {
    const matchCat = category === "Все" || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const sendAdminMessage = () => {
    if (!adminInput.trim()) return;
    const msg: AdminMessage = { from: "admin", text: adminInput, time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }) };
    setAdminMessages(prev => [...prev, msg]);
    setAdminInput("");
    setTimeout(() => {
      setAdminMessages(prev => [...prev, { from: "user", text: "Спасибо за ответ! Мы разберёмся.", time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }) }]);
    }, 1200);
  };

  const handleCheckout = () => {
    if (!checkoutAddress.street || !checkoutAddress.house || !checkoutAddress.checkPhone) return;
    setCheckoutDone(true);
    setCart([]);
    setTimeout(() => { setCheckoutDone(false); setScreen("shop"); }, 3500);
  };

  const dk = theme === "dark";
  const cardBg = dk ? "bg-gray-900" : "bg-white";
  const pageBg = dk ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900";
  const inputCls = `w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors focus:border-blue-500 text-sm ${dk ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900"}`;
  const headerBg = dk ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";

  // ─── LANDING ─────────────────────────────────────────────────────────────────
  if (screen === "landing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#001f5b] via-[#0050d0] to-[#38bdf8] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white/5 animate-pulse"
              style={{ width: `${80 + i * 70}px`, height: `${80 + i * 70}px`, left: `${5 + i * 13}%`, top: `${3 + i * 11}%`, animationDelay: `${i * 0.6}s`, animationDuration: `${4 + i * 0.7}s` }} />
          ))}
        </div>

        <div className="relative z-10 text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl mb-6 border border-white/20">
            <span className="text-3xl">⚡</span>
            <span className="text-3xl font-black text-white" style={{ fontFamily: "Golos Text, sans-serif" }}>
              Volt<span className="text-yellow-300">Mall</span>
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight">
            Маркетплейс<br/>
            <span className="text-yellow-300">электроники и ПО</span>
          </h1>
          <p className="text-blue-100 text-base">🚚 Доставка по всему Петрозаводску</p>
        </div>

        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 px-4 max-w-2xl w-full">
          {LANDING_ITEMS.map((item, i) => (
            <div key={i}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${item.delay + 0.2}s`, animationFillMode: "both" }}>
              <div className="text-3xl mb-2">{item.emoji}</div>
              <div className="text-white text-xs font-semibold leading-tight mb-1">{item.name}</div>
              <div className="text-yellow-300 text-xs font-bold">{item.price}</div>
            </div>
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4 animate-fade-in" style={{ animationDelay: "1.3s", animationFillMode: "both" }}>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => setScreen("login")}
              className="bg-yellow-300 text-[#001f5b] font-black text-lg px-10 py-4 rounded-2xl hover:bg-yellow-200 transition-all duration-200 hover:scale-105 shadow-2xl shadow-yellow-400/40">
              Войти →
            </button>
            <button onClick={() => setScreen("register")}
              className="bg-white/15 backdrop-blur-sm text-white font-bold text-lg px-10 py-4 rounded-2xl border border-white/30 hover:bg-white/25 transition-all duration-200 hover:scale-105">
              Создать аккаунт
            </button>
          </div>
          <p className="text-blue-200 text-sm opacity-80">Тысячи товаров • Лучшие цены • Быстрая доставка</p>
        </div>
      </div>
    );
  }

  // ─── LOGIN ───────────────────────────────────────────────────────────────────
  if (screen === "login") {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dk ? "bg-gray-950" : "bg-gradient-to-br from-blue-50 via-white to-blue-50"}`}>
        <div className={`w-full max-w-md mx-4 rounded-3xl p-8 shadow-2xl animate-scale-in ${cardBg}`}>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-3xl">⚡</span>
            <span className="text-2xl font-black" style={{ fontFamily: "Golos Text, sans-serif" }}>
              Volt<span className="text-blue-600">Mall</span>
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-1">Добро пожаловать!</h2>
          <p className={`text-sm mb-6 ${dk ? "text-gray-400" : "text-gray-500"}`}>Войдите в свой аккаунт</p>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${dk ? "text-gray-300" : "text-gray-700"}`}>Email</label>
              <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="example@mail.ru" type="email" className={inputCls} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${dk ? "text-gray-300" : "text-gray-700"}`}>Пароль</label>
              <input value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="Ваш пароль" type="password" className={inputCls} />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <span>⚠️</span> {loginError}
              </div>
            )}

            <button onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] text-base">
              Войти →
            </button>

            <div className={`relative flex items-center gap-3 ${dk ? "text-gray-600" : "text-gray-300"}`}>
              <div className="flex-1 h-px bg-current" />
              <span className={`text-xs ${dk ? "text-gray-500" : "text-gray-400"}`}>или</span>
              <div className="flex-1 h-px bg-current" />
            </div>

            <YandexLoginButton
              onClick={yandexAuth.login}
              isLoading={yandexAuth.isLoading}
              className="w-full py-3.5 text-base font-bold rounded-xl"
            />

            <button onClick={() => { setLoginError(""); setScreen("register"); }}
              className={`w-full py-3 rounded-xl border-2 font-semibold text-sm transition-all ${dk ? "border-gray-700 text-gray-300 hover:border-blue-500 hover:text-blue-400" : "border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"}`}>
              Создать новый аккаунт
            </button>
          </div>

          <button onClick={() => setScreen("landing")} className={`mt-5 text-sm w-full text-center ${dk ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"} transition-colors`}>
            ← Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  // ─── REGISTER ────────────────────────────────────────────────────────────────
  if (screen === "register") {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dk ? "bg-gray-950" : "bg-gradient-to-br from-blue-50 via-white to-blue-50"}`}>
        <div className={`w-full max-w-md mx-4 rounded-3xl p-8 shadow-2xl animate-scale-in ${cardBg}`}>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-3xl">⚡</span>
            <span className="text-2xl font-black" style={{ fontFamily: "Golos Text, sans-serif" }}>
              Volt<span className="text-blue-600">Mall</span>
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-1">Создать аккаунт</h2>
          <p className={`text-sm mb-6 ${dk ? "text-gray-400" : "text-gray-500"}`}>Заполните данные для регистрации</p>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${dk ? "text-gray-300" : "text-gray-700"}`}>Номер телефона</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 (900) 123-45-67" className={inputCls} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${dk ? "text-gray-300" : "text-gray-700"}`}>Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="example@mail.ru" type="email" className={inputCls} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${dk ? "text-gray-300" : "text-gray-700"}`}>Пароль</label>
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Минимум 6 символов" type="password" className={inputCls} />
            </div>

            {regError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <span>⚠️</span> {regError}
              </div>
            )}

            <button onClick={handleRegister}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] text-base">
              Продолжить →
            </button>

            <div className={`relative flex items-center gap-3 ${dk ? "text-gray-600" : "text-gray-300"}`}>
              <div className="flex-1 h-px bg-current" />
              <span className={`text-xs ${dk ? "text-gray-500" : "text-gray-400"}`}>или быстрая регистрация</span>
              <div className="flex-1 h-px bg-current" />
            </div>

            <YandexLoginButton
              onClick={yandexAuth.login}
              isLoading={yandexAuth.isLoading}
              buttonText="Зарегистрироваться через Яндекс"
              className="w-full py-3.5 text-base font-bold rounded-xl"
            />
          </div>

          <div className="mt-5 flex flex-col gap-2 items-center">
            <button onClick={() => { setRegError(""); setScreen("login"); }}
              className={`text-sm font-medium ${dk ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"} transition-colors`}>
              Уже есть аккаунт? Войти →
            </button>
            <button onClick={() => setScreen("landing")} className={`text-sm ${dk ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"} transition-colors`}>
              ← Вернуться на главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── CAPTCHA ──────────────────────────────────────────────────────────────────
  if (screen === "captcha") {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dk ? "bg-gray-950" : "bg-gradient-to-br from-blue-50 via-white to-blue-50"}`}>
        <div className={`w-full max-w-sm mx-4 rounded-3xl p-8 shadow-2xl animate-scale-in ${cardBg}`}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🛡️</span>
            </div>
            <h2 className="text-xl font-bold mb-1">Подтверждение</h2>
            <p className={`text-sm ${dk ? "text-gray-400" : "text-gray-500"}`}>Подтвердите, что вы не робот</p>
          </div>

          <div className={`border-2 rounded-2xl p-5 mb-6 transition-colors ${captchaChecked ? "border-green-400 bg-green-50" : dk ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div onClick={() => setCaptchaChecked(!captchaChecked)}
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${captchaChecked ? "bg-green-500 border-green-500" : dk ? "border-gray-500 bg-gray-700" : "border-gray-400 bg-white"}`}>
                {captchaChecked && <span className="text-white text-sm font-bold">✓</span>}
              </div>
              <span className={`font-semibold flex-1 ${dk ? "text-gray-200" : "text-gray-700"}`}>Я не робот</span>
              <div className="flex flex-col items-center">
                <div className="text-lg">🔒</div>
                <span className="text-xs text-gray-400">reCAPTCHA</span>
              </div>
            </label>
          </div>

          <button onClick={handleCaptcha} disabled={!captchaChecked}
            className={`w-full font-bold py-3.5 rounded-xl transition-all duration-200 text-base ${captchaChecked ? "bg-green-500 hover:bg-green-600 text-white hover:scale-[1.02] shadow-lg shadow-green-200" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
            {captchaChecked ? "Создать аккаунт ✓" : "Подтвердите капчу"}
          </button>
        </div>
      </div>
    );
  }

  // ─── CREATING ─────────────────────────────────────────────────────────────────
  if (screen === "creating") {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dk ? "bg-gray-950" : "bg-gradient-to-br from-blue-50 to-white"}`}>
        <div className="text-center animate-scale-in px-4">
          <div className="text-6xl mb-6 animate-bounce">⚡</div>
          <h2 className={`text-2xl font-black mb-2 ${dk ? "text-white" : "text-gray-900"}`} style={{ fontFamily: "Golos Text, sans-serif" }}>
            Создаём ваш аккаунт...
          </h2>
          <p className={`text-sm mb-8 ${dk ? "text-gray-400" : "text-gray-500"}`}>VoltMall подбирает лучшие предложения для вас</p>
          <div className={`w-72 h-3 rounded-full mx-auto overflow-hidden ${dk ? "bg-gray-800" : "bg-gray-200"}`}>
            <div className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 rounded-full transition-all duration-100 shadow-sm" style={{ width: `${creatingProgress}%` }} />
          </div>
          <div className="flex justify-between w-72 mx-auto mt-2">
            <p className={`text-xs ${dk ? "text-gray-500" : "text-gray-400"}`}>Настройка аккаунта</p>
            <p className={`text-xs font-bold ${dk ? "text-gray-400" : "text-gray-600"}`}>{creatingProgress}%</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── CHECKOUT ─────────────────────────────────────────────────────────────────
  if (screen === "checkout") {
    return (
      <div className={`min-h-screen ${pageBg}`}>
        <header className={`${headerBg} border-b px-4 py-4 flex items-center gap-3`}>
          <button onClick={() => setScreen("cart")} className="text-blue-500 font-medium text-sm">← Назад</button>
          <h1 className="text-lg font-bold">Оформление заказа</h1>
        </header>
        <div className="max-w-md mx-auto p-4 space-y-4">
          {checkoutDone ? (
            <div className="text-center py-20 animate-scale-in">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-black mb-3">Заказ оформлен!</h2>
              <p className={`text-sm ${dk ? "text-gray-400" : "text-gray-500"}`}>Курьер свяжется с вами для подтверждения доставки по Петрозаводску</p>
            </div>
          ) : (
            <>
              <div className={`rounded-2xl p-5 ${cardBg} shadow-sm`}>
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span>📍</span> Адрес доставки
                  <span className={`text-xs font-normal ml-1 ${dk ? "text-gray-400" : "text-gray-500"}`}>(только Петрозаводск)</span>
                </h3>
                <div className="space-y-3">
                  <input value={checkoutAddress.street} onChange={e => setCheckoutAddress(p => ({...p, street: e.target.value}))} placeholder="Улица *" className={inputCls} />
                  <div className="grid grid-cols-3 gap-2">
                    <input value={checkoutAddress.house} onChange={e => setCheckoutAddress(p => ({...p, house: e.target.value}))} placeholder="Дом *"
                      className={`px-3 py-3 rounded-xl border-2 outline-none focus:border-blue-500 text-sm ${dk ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`} />
                    <input value={checkoutAddress.apt} onChange={e => setCheckoutAddress(p => ({...p, apt: e.target.value}))} placeholder="Кв."
                      className={`px-3 py-3 rounded-xl border-2 outline-none focus:border-blue-500 text-sm ${dk ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`} />
                    <input value={checkoutAddress.floor} onChange={e => setCheckoutAddress(p => ({...p, floor: e.target.value}))} placeholder="Этаж"
                      className={`px-3 py-3 rounded-xl border-2 outline-none focus:border-blue-500 text-sm ${dk ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`} />
                  </div>
                  <input value={checkoutAddress.checkPhone} onChange={e => setCheckoutAddress(p => ({...p, checkPhone: e.target.value}))} placeholder="Номер телефона для связи *" className={inputCls} />
                </div>
              </div>

              <div className={`rounded-2xl p-5 ${cardBg} shadow-sm`}>
                <h3 className="font-bold mb-3">Ваш заказ</h3>
                {cart.map(i => (
                  <div key={i.product.id} className={`flex justify-between text-sm py-2 border-b last:border-0 ${dk ? "border-gray-800" : "border-gray-100"}`}>
                    <span className="flex-1 pr-2">{i.product.emoji} {i.product.name} × {i.qty}</span>
                    <span className="font-bold flex-shrink-0">{(i.product.price * i.qty).toLocaleString()} ₽</span>
                  </div>
                ))}
                <div className="flex justify-between font-black text-xl mt-4 pt-2">
                  <span>Итого</span>
                  <span className="text-blue-600">{cartTotal.toLocaleString()} ₽</span>
                </div>
              </div>

              <button onClick={handleCheckout}
                disabled={!checkoutAddress.street || !checkoutAddress.house || !checkoutAddress.checkPhone}
                className={`w-full font-bold py-4 rounded-2xl transition-all text-base ${checkoutAddress.street && checkoutAddress.house && checkoutAddress.checkPhone ? "bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02]" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                Подтвердить заказ
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── PRODUCT PAGE ─────────────────────────────────────────────────────────────
  if (screen === "product" && selectedProduct) {
    return (
      <div className={`min-h-screen ${pageBg}`}>
        <header className={`${headerBg} border-b px-4 py-4 flex items-center gap-3`}>
          <button onClick={() => setScreen("shop")} className="text-blue-500 font-medium text-sm">← Назад</button>
          <span className={`font-bold flex-1 truncate text-sm ${dk ? "text-gray-200" : "text-gray-700"}`}>{selectedProduct.name}</span>
          <button onClick={() => setScreen("cart")} className="relative p-1">
            <Icon name="ShoppingCart" size={22} />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">{cart.reduce((s,i)=>s+i.qty,0)}</span>}
          </button>
        </header>
        <div className="max-w-lg mx-auto p-4">
          <div className={`rounded-3xl p-8 text-center mb-4 ${cardBg} shadow-sm`}>
            <div className="text-8xl mb-4">{selectedProduct.emoji}</div>
            {selectedProduct.badge && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                selectedProduct.badge === "Хит" ? "bg-red-100 text-red-600" :
                selectedProduct.badge === "Новинка" ? "bg-green-100 text-green-600" :
                selectedProduct.badge === "Топ" ? "bg-purple-100 text-purple-600" :
                "bg-orange-100 text-orange-600"
              }`}>{selectedProduct.badge}</span>
            )}
            <h1 className="text-xl font-black mt-4 mb-2 leading-snug">{selectedProduct.name}</h1>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-yellow-400 text-sm">★★★★★</span>
              <span className="font-bold text-sm">{selectedProduct.rating}</span>
              <span className={`text-xs ${dk ? "text-gray-400" : "text-gray-500"}`}>({selectedProduct.reviews.toLocaleString()} отзывов)</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-black text-blue-600">{selectedProduct.price.toLocaleString()} ₽</span>
              {selectedProduct.oldPrice && <span className={`text-lg line-through ${dk ? "text-gray-500" : "text-gray-400"}`}>{selectedProduct.oldPrice.toLocaleString()} ₽</span>}
            </div>
            {selectedProduct.oldPrice && (
              <div className="inline-block mt-2 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                Скидка {Math.round((1 - selectedProduct.price / selectedProduct.oldPrice) * 100)}%
              </div>
            )}
          </div>

          <div className={`rounded-2xl p-5 mb-4 ${cardBg} shadow-sm`}>
            <h3 className="font-bold mb-3">📋 Характеристики</h3>
            <div className="space-y-0">
              {selectedProduct.specs.map((s, i) => (
                <div key={i} className={`flex items-center gap-2 text-sm py-2.5 border-b last:border-0 ${dk ? "border-gray-800" : "border-gray-100"}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl p-4 mb-4 flex items-center gap-3 ${dk ? "bg-blue-950/50 border border-blue-900" : "bg-blue-50 border border-blue-100"}`}>
            <span className="text-2xl">🚚</span>
            <div>
              <div className="font-bold text-sm">Доставка по Петрозаводску</div>
              <div className={`text-xs mt-0.5 ${dk ? "text-blue-400" : "text-blue-600"}`}>Курьером до двери • 1–2 дня • Бесплатно</div>
            </div>
          </div>

          <button onClick={() => { addToCart(selectedProduct); setScreen("shop"); }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] text-base shadow-lg shadow-blue-200">
            🛒 Добавить в корзину
          </button>
        </div>
      </div>
    );
  }

  // ─── CART ─────────────────────────────────────────────────────────────────────
  if (screen === "cart") {
    return (
      <div className={`min-h-screen ${pageBg}`}>
        <header className={`${headerBg} border-b px-4 py-4 flex items-center gap-3`}>
          <button onClick={() => setScreen("shop")} className="text-blue-500 font-medium text-sm">← Назад</button>
          <h1 className="text-lg font-bold">Корзина</h1>
          {cart.length > 0 && <span className={`ml-auto text-sm ${dk ? "text-gray-400" : "text-gray-500"}`}>{cart.reduce((s,i)=>s+i.qty,0)} товара</span>}
        </header>
        <div className="max-w-lg mx-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🛒</div>
              <p className={`text-lg font-bold mb-2 ${dk ? "text-gray-300" : "text-gray-700"}`}>Корзина пуста</p>
              <p className={`text-sm mb-6 ${dk ? "text-gray-500" : "text-gray-400"}`}>Добавьте товары из каталога</p>
              <button onClick={() => setScreen("shop")} className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700">
                Перейти к покупкам
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {cart.map(item => (
                  <div key={item.product.id} className={`rounded-2xl p-4 flex items-center gap-3 ${cardBg} shadow-sm`}>
                    <span className="text-3xl flex-shrink-0">{item.product.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm leading-tight line-clamp-2 ${dk ? "text-gray-200" : "text-gray-800"}`}>{item.product.name}</div>
                      <div className="text-blue-600 font-black mt-1">{(item.product.price * item.qty).toLocaleString()} ₽</div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => setCart(p => p.map(i => i.product.id === item.product.id ? {...i, qty: Math.max(1, i.qty-1)} : i))}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-base ${dk ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-700"}`}>−</button>
                      <span className="w-6 text-center font-bold text-sm">{item.qty}</span>
                      <button onClick={() => setCart(p => p.map(i => i.product.id === item.product.id ? {...i, qty: i.qty+1} : i))}
                        className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-gray-400 hover:text-red-500 ml-1 transition-colors flex-shrink-0">
                      <Icon name="X" size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className={`rounded-2xl p-5 mb-4 ${cardBg} shadow-sm`}>
                <div className="flex justify-between items-end">
                  <div>
                    <p className={`text-sm ${dk ? "text-gray-400" : "text-gray-500"}`}>Итого за {cart.reduce((s,i)=>s+i.qty,0)} товара</p>
                    <p className="text-3xl font-black text-blue-600 mt-1">{cartTotal.toLocaleString()} ₽</p>
                  </div>
                  <p className={`text-xs ${dk ? "text-gray-500" : "text-gray-400"}`}>🚚 Доставка бесплатно</p>
                </div>
              </div>

              <button onClick={() => setScreen("checkout")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] text-base shadow-lg shadow-blue-200">
                Оформить заказ →
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── SETTINGS ────────────────────────────────────────────────────────────────
  if (screen === "settings") {
    return (
      <div className={`min-h-screen ${pageBg}`}>
        <header className={`${headerBg} border-b px-4 py-4 flex items-center gap-3`}>
          <button onClick={() => setScreen("shop")} className="text-blue-500 font-medium text-sm">← Назад</button>
          <h1 className="text-lg font-bold">Настройки</h1>
        </header>
        <div className="max-w-md mx-auto p-4 space-y-4">
          <div className={`rounded-2xl p-5 ${cardBg} shadow-sm`}>
            <h3 className="font-bold mb-4 flex items-center gap-2">🎨 Оформление</h3>
            <div className="flex gap-3">
              <button onClick={() => setTheme("light")}
                className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${theme === "light" ? "border-blue-600 bg-blue-50 text-blue-700" : dk ? "border-gray-700 text-gray-400 hover:border-gray-600" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                ☀️ Светлая
              </button>
              <button onClick={() => setTheme("dark")}
                className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${theme === "dark" ? "border-blue-500 bg-blue-950 text-blue-400" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                🌙 Тёмная
              </button>
            </div>
          </div>

          {user && (
            <div className={`rounded-2xl p-5 ${cardBg} shadow-sm`}>
              <h3 className="font-bold mb-4 flex items-center gap-2">👤 Профиль</h3>
              <div className="space-y-0">
                {[
                  { label: "Email", value: user.email },
                  { label: "Телефон", value: user.phone },
                  { label: "Статус", value: user.isAdmin ? "👑 Администратор" : "✅ Покупатель", color: user.isAdmin ? "text-yellow-500" : "text-green-500" },
                ].map((row, i) => (
                  <div key={i} className={`flex justify-between items-center text-sm py-3 border-b last:border-0 ${dk ? "border-gray-800" : "border-gray-100"}`}>
                    <span className={dk ? "text-gray-400" : "text-gray-500"}>{row.label}</span>
                    <span className={`font-semibold ${row.color || ""}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`rounded-2xl p-5 ${cardBg} shadow-sm`}>
            <h3 className="font-bold mb-4 flex items-center gap-2">🎟️ Промокод</h3>
            <div className="flex gap-2">
              <input value={promoCode} onChange={e => setPromoCode(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handlePromo()}
                placeholder="Введите промокод"
                className={`flex-1 px-4 py-3 rounded-xl border-2 outline-none focus:border-blue-500 text-sm ${dk ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200"}`} />
              <button onClick={handlePromo} className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 flex-shrink-0">
                Применить
              </button>
            </div>
            {promoResult && <p className={`text-sm mt-2 font-medium ${promoResult.includes("✅") ? "text-green-500" : "text-red-500"}`}>{promoResult}</p>}
          </div>

          <div className={`rounded-2xl p-5 ${cardBg} shadow-sm`}>
            <h3 className="font-bold mb-4 flex items-center gap-2">💬 Связаться с разработчиком</h3>
            <a href="https://t.me/HellwayYT" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#2AABEE] hover:bg-[#229ed9] text-white font-bold py-3 px-5 rounded-xl transition-all hover:scale-[1.02]">
              <span className="text-xl">✈️</span>
              <div>
                <div className="text-sm font-black">@HellwayYT</div>
                <div className="text-xs opacity-80">Telegram</div>
              </div>
            </a>
          </div>

          <div className={`rounded-2xl p-5 ${cardBg} shadow-sm`}>
            <h3 className={`font-bold mb-1 ${dk ? "text-gray-200" : "text-gray-800"}`}>Выход из аккаунта</h3>
            <p className={`text-xs mb-4 ${dk ? "text-gray-500" : "text-gray-400"}`}>Вы выйдете на всех устройствах</p>
            <button onClick={handleLogout}
              className="w-full py-3.5 rounded-xl font-bold text-base bg-red-500 hover:bg-red-600 text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-red-200 flex items-center justify-center gap-2">
              <span>🚪</span> Выйти из аккаунта
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── ADMIN ────────────────────────────────────────────────────────────────────
  if (screen === "admin") {
    return (
      <div className={`min-h-screen ${pageBg}`}>
        <header className={`${headerBg} border-b px-4 py-4 flex items-center gap-3`}>
          <button onClick={() => setScreen("shop")} className="text-blue-500 font-medium text-sm">← Назад</button>
          <h1 className="text-lg font-bold">👑 Панель администратора</h1>
        </header>
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Пользователи", value: users.length, icon: "👥", color: "text-blue-600" },
              { label: "Товаров", value: PRODUCTS.length, icon: "📦", color: "text-green-600" },
              { label: "В корзине", value: cart.reduce((s,i)=>s+i.qty,0), icon: "🛒", color: "text-orange-500" },
            ].map((s, i) => (
              <div key={i} className={`rounded-2xl p-4 text-center ${cardBg} shadow-sm`}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className={`text-xs mt-0.5 ${dk ? "text-gray-400" : "text-gray-500"}`}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className={`rounded-2xl overflow-hidden ${cardBg} shadow-sm`}>
            <button onClick={() => setLogsExpanded(!logsExpanded)}
              className={`w-full flex items-center justify-between p-5 font-bold transition-colors ${dk ? "hover:bg-gray-800" : "hover:bg-gray-50"}`}>
              <span>📋 Логи в реальном времени</span>
              <Icon name={logsExpanded ? "ChevronUp" : "ChevronDown"} size={18} />
            </button>
            {logsExpanded && (
              <div className="px-4 pb-4">
                <div ref={logsRef} className="bg-[#0d1117] rounded-xl p-4 font-mono text-xs text-green-400 max-h-52 overflow-y-auto space-y-1.5">
                  {ADMIN_LOGS.map((log, i) => <div key={i} className="hover:text-green-300 transition-colors">{log}</div>)}
                  <div className="text-green-300 animate-pulse">█ ожидание событий...</div>
                </div>
              </div>
            )}
          </div>

          <div className={`rounded-2xl p-5 ${cardBg} shadow-sm`}>
            <h3 className="font-bold mb-4">👥 Зарегистрированные пользователи ({users.length})</h3>
            {users.length === 0 ? (
              <p className={`text-sm ${dk ? "text-gray-400" : "text-gray-500"}`}>Пока нет пользователей</p>
            ) : (
              <div className="space-y-0">
                {users.map((u, i) => (
                  <div key={i} className={`flex items-center justify-between py-3 border-b last:border-0 ${dk ? "border-gray-800" : "border-gray-100"}`}>
                    <div>
                      <div className="font-semibold text-sm">{u.email}</div>
                      <div className={`text-xs mt-0.5 ${dk ? "text-gray-500" : "text-gray-400"}`}>{u.phone}</div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${u.isAdmin ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                      {u.isAdmin ? "👑 Админ" : "Покупатель"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`rounded-2xl p-5 ${cardBg} shadow-sm`}>
            <h3 className="font-bold mb-4">💬 Чат с покупателями</h3>
            <div className={`rounded-xl p-3 h-52 overflow-y-auto mb-3 space-y-2 ${dk ? "bg-gray-800" : "bg-gray-50"}`}>
              {adminMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "admin" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${msg.from === "admin" ? "bg-blue-600 text-white rounded-br-sm" : dk ? "bg-gray-700 text-gray-200 rounded-bl-sm" : "bg-white text-gray-800 shadow-sm rounded-bl-sm"}`}>
                    <p>{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.from === "admin" ? "text-blue-200" : dk ? "text-gray-500" : "text-gray-400"}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={adminInput} onChange={e => setAdminInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendAdminMessage()}
                placeholder="Написать покупателю..."
                className={`flex-1 px-4 py-2.5 rounded-xl border-2 outline-none focus:border-blue-500 text-sm ${dk ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200"}`} />
              <button onClick={sendAdminMessage} className="bg-blue-600 text-white px-4 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                <Icon name="Send" size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── SHOP ─────────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${pageBg}`}>
      <header className={`sticky top-0 z-40 ${headerBg} border-b shadow-sm`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xl">⚡</span>
            <span className="font-black text-lg hidden sm:block" style={{ fontFamily: "Golos Text, sans-serif" }}>
              Volt<span className="text-blue-600">Mall</span>
            </span>
          </div>

          <div className="flex-1 mx-1 sm:mx-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${dk ? "bg-gray-800" : "bg-gray-100"}`}>
              <Icon name="Search" size={15} className={dk ? "text-gray-400" : "text-gray-500"} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск товаров..."
                className={`flex-1 bg-transparent outline-none text-sm ${dk ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"}`} />
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button onClick={() => setScreen("cart")} className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
              <Icon name="ShoppingCart" size={21} />
              {cart.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-black">
                  {cart.reduce((s,i)=>s+i.qty,0)}
                </span>
              )}
            </button>
            <button onClick={() => setScreen("settings")} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
              <Icon name="Settings" size={21} />
            </button>
            {user?.isAdmin && (
              <button onClick={() => setScreen("admin")}
                className="px-2.5 py-1.5 bg-yellow-400 text-yellow-900 font-black text-xs rounded-xl hover:bg-yellow-300 transition-colors hidden sm:flex items-center gap-1">
                <span>👑</span> Админ
              </button>
            )}
          </div>
        </div>

        <div className={`px-4 py-1.5 flex items-center gap-2 text-xs border-t ${dk ? "border-gray-800 text-gray-400" : "border-gray-100 text-gray-500"}`}>
          <Icon name="MapPin" size={11} />
          <span>Доставка: <strong className={dk ? "text-blue-400" : "text-blue-600"}>Петрозаводск</strong></span>
          <span className="ml-auto flex items-center gap-1">
            <span className={dk ? "text-gray-500" : "text-gray-400"}>Привет,</span>
            <strong className={dk ? "text-gray-200" : "text-gray-700"}>{user?.email?.split("@")[0] || "Гость"}</strong>
            {user?.isAdmin && <span>👑</span>}
          </span>
        </div>

        <div className={`px-4 py-2 flex gap-2 overflow-x-auto border-t ${dk ? "border-gray-800" : "border-gray-100"}`} style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${category === cat ? "bg-blue-600 text-white shadow-sm" : dk ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pt-4">
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 rounded-3xl p-6 mb-6 flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-blue-100 text-sm font-medium mb-1">⚡ Лучшие предложения</p>
            <h2 className="text-xl sm:text-2xl font-black text-white mb-3 leading-tight">
              Электроника и ПО<br className="hidden sm:block" />
              <span className="text-yellow-300">со скидкой до 30%</span>
            </h2>
            <button className="bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-all hover:scale-[1.02]">
              Смотреть акции
            </button>
          </div>
          <div className="text-5xl sm:text-6xl opacity-90 select-none hidden sm:block">📱💻⚡</div>
          <div className="absolute -right-6 -top-6 w-36 h-36 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-white/10 rounded-full pointer-events-none" />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 pb-10">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-bold text-base">
            {category === "Все" ? "Все товары" : category}
          </h2>
          <span className={`text-sm font-normal ${dk ? "text-gray-500" : "text-gray-400"}`}>
            {filteredProducts.length} шт.
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-3">🔍</div>
            <p className={`font-bold mb-1 ${dk ? "text-gray-300" : "text-gray-600"}`}>Ничего не найдено</p>
            <p className={`text-sm ${dk ? "text-gray-500" : "text-gray-400"}`}>Попробуйте другой запрос</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((product, i) => (
              <div key={product.id}
                className={`rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer animate-fade-in ${cardBg} shadow-sm`}
                style={{ animationDelay: `${i * 0.035}s`, animationFillMode: "both" }}
                onClick={() => { setSelectedProduct(product); setScreen("product"); }}>
                <div className={`p-5 text-center relative ${dk ? "bg-gray-800" : "bg-gradient-to-br from-blue-50 to-gray-50"}`}>
                  <div className="text-4xl">{product.emoji}</div>
                  {product.badge && (
                    <span className={`absolute top-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded-lg ${
                      product.badge === "Хит" ? "bg-red-500 text-white" :
                      product.badge === "Новинка" ? "bg-green-500 text-white" :
                      product.badge === "Топ" ? "bg-purple-500 text-white" :
                      product.badge === "Игровой" ? "bg-orange-500 text-white" :
                      "bg-blue-500 text-white"
                    }`}>{product.badge}</span>
                  )}
                </div>
                <div className="p-3">
                  <p className={`text-xs font-semibold leading-snug mb-2 line-clamp-2 ${dk ? "text-gray-200" : "text-gray-800"}`}>
                    {product.name}
                  </p>
                  <div className="flex items-center gap-1 mb-2.5">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className={`text-xs font-medium ${dk ? "text-gray-300" : "text-gray-600"}`}>{product.rating}</span>
                    <span className={`text-xs ${dk ? "text-gray-500" : "text-gray-400"}`}>({product.reviews > 999 ? Math.round(product.reviews/1000)+"к" : product.reviews})</span>
                  </div>
                  <div className="flex items-end justify-between gap-1">
                    <div>
                      <div className="font-black text-blue-600 text-sm">{product.price.toLocaleString()} ₽</div>
                      {product.oldPrice && <div className={`text-xs line-through ${dk ? "text-gray-500" : "text-gray-400"}`}>{product.oldPrice.toLocaleString()} ₽</div>}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); addToCart(product); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white w-8 h-8 rounded-xl flex items-center justify-center font-black text-lg transition-all hover:scale-110 flex-shrink-0">
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}