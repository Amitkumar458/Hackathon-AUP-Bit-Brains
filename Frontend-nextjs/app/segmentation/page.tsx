'use client';

import Link from "next/link";
import Image from "next/image";

export default function SegmentationPage() {
  return (
    <div className="min-h-screen bg-white">

      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Segmentation</h1>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Live Segmentation Card */}
          <Link href="/segmentation/live" className="group">
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="mb-4 flex justify-center">
                <Image 
                  src="/globe.svg" 
                  alt="Live Segmentation"
                  width={64}
                  height={64}
                  className="group-hover:scale-110 transition-transform"
                />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-center">Live Segmentation</h2>
              <p className="text-gray-600 text-center">
                Perform real-time segmentation using live data streams
              </p>
            </div>
          </Link>

          {/* File Upload Card */}
          <Link href="/uhi/upload" className="group">
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="mb-4 flex justify-center">
                <Image 
                  src="/file.svg" 
                  alt="File Upload"
                  width={64}
                  height={64}
                  className="group-hover:scale-110 transition-transform"
                />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-center">From File</h2>
              <p className="text-gray-600 text-center">
                Upload and analyze segmentation from existing files
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}