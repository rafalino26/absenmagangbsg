export default function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-6 bg-white lg:p-8">
      <div className="max-w-7xl mx-auto animate-pulse">
        {/* Skeleton untuk Header Sapaan */}
        <div className="flex items-start gap-4 md:gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-200"></div>
          <div className="flex-grow pt-2 space-y-3">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
        
        {/* Skeleton untuk Info Rekening */}
        <div className="mt-6 p-4 bg-gray-200 rounded-lg h-16 w-full"></div>

        {/* Skeleton untuk Tombol Aksi */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
        </div>

        {/* Skeleton untuk Riwayat Absensi */}
        <div className="mt-10">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3 p-4 bg-white rounded-lg border">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}