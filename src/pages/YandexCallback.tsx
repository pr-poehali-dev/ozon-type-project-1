import { useEffect, useState } from "react";
import { useYandexAuth } from "@/components/extensions/yandex-auth/useYandexAuth";

const YANDEX_AUTH_URL = "https://functions.poehali.dev/b9eb14dd-44e2-4b02-8e2d-842ae754f242";

export default function YandexCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const auth = useYandexAuth({
    apiUrls: {
      authUrl: `${YANDEX_AUTH_URL}?action=auth-url`,
      callback: `${YANDEX_AUTH_URL}?action=callback`,
      refresh: `${YANDEX_AUTH_URL}?action=refresh`,
      logout: `${YANDEX_AUTH_URL}?action=logout`,
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    if (error) {
      setStatus("error");
      setErrorMsg("Яндекс отказал в доступе. Попробуйте ещё раз.");
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorMsg("Не получен код авторизации от Яндекса.");
      return;
    }

    auth.handleCallback(params).then((success) => {
      if (success) {
        setStatus("success");
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        setStatus("error");
        setErrorMsg(auth.error || "Ошибка авторизации. Проверьте настройки приложения.");
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
      <div className="bg-white rounded-3xl p-10 shadow-2xl text-center max-w-sm w-full mx-4 animate-scale-in">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-3xl">⚡</span>
          <span className="text-2xl font-black" style={{ fontFamily: "Golos Text, sans-serif" }}>
            Volt<span className="text-blue-600">Mall</span>
          </span>
        </div>

        {status === "loading" && (
          <>
            <div className="w-16 h-16 mx-auto mb-5 relative">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">Я</div>
            </div>
            <h2 className="text-xl font-bold mb-2 text-gray-900">Входим через Яндекс</h2>
            <p className="text-sm text-gray-500">Подтверждаем вашу учётную запись...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 mx-auto mb-5 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-xl font-bold mb-2 text-gray-900">Вход выполнен!</h2>
            <p className="text-sm text-gray-500">Переходим в магазин...</p>
            <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full animate-pulse" style={{ width: "100%" }} />
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto mb-5 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-xl font-bold mb-2 text-gray-900">Ошибка входа</h2>
            <p className="text-sm text-red-500 mb-6">{errorMsg}</p>
            <a href="/"
              className="block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-[1.02]">
              Вернуться на главную
            </a>
          </>
        )}
      </div>
    </div>
  );
}
