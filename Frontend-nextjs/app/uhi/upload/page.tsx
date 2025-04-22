'use client';

import { UploadPage } from "@/components/CustomComps/UploadPage";

export default function FileUploadPage() {
  return (
    <div className="min-h-screen bg-white">
      
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">File Upload for Segmentation</h1>
        <UploadPage />
      </div>
    </div>
  );
}


