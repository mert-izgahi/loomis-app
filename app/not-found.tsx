import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-semibold">404 - Sayfa Bulunamadı</h1>
      <p className="text-gray-500 mt-2">
        Üzgünüz, aradığınız sayfa mevcut değil veya taşınmış olabilir.
      </p>
      <Link href="/" className="text-red-600 mt-4">
        Ana sayfaya dön
      </Link>
    </div>
  );
}
