export default function AdminDashboardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Skeleton untuk Judul Halaman */}
      <div className="mb-6">
        <div className="h-9 w-1/3 bg-gray-200 rounded-md"></div>
        <div className="mt-2 h-6 w-1/2 bg-gray-200 rounded-md"></div>
      </div>

      {/* Skeleton untuk Kontrol Filter & Tombol */}
      <div className="mb-4 h-20 bg-gray-200 rounded-lg"></div>

      {/* Skeleton untuk Tombol Tambah Peserta */}
      <div className="mb-4 flex justify-end">
        <div className="h-10 w-40 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Skeleton untuk Tabel */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="space-y-3">
          <div className="h-5 bg-gray-200 rounded"></div>
          <div className="h-5 bg-gray-200 rounded"></div>
          <div className="h-5 bg-gray-200 rounded"></div>
          <div className="h-5 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}