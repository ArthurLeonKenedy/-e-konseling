import React, { Suspense } from "react";
import SearchParamsWrapper from "./SearchParamsWrapper";

export default function UserManagementPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen mesh-bg font-sans flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-emerald-800 font-bold tracking-widest text-sm uppercase">Memuat Data...</p>
          </div>
        </div>
      }
    >
      <SearchParamsWrapper />
    </Suspense>
  );
}
