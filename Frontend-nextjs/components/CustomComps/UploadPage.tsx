'use client';

import { useState, useEffect } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import ImageCompare from './ImageCompare';


interface AnalysisData {
  analysis: {
    analysis: {
      high_heat_areas: string[];
      risk_level: string;
    };
    recommendations: {
      immediate_actions: string[];
      long_term_actions: string[];
      estimated_temperature_reduction: string;
      implementation_timeline: {
        immediate_actions: string;
        long_term_actions: string;
      };
    };
    sustainability_impact: {
      environmental_benefits: string[];
      economic_benefits: string[];
    };
  };
  success: boolean;
}

export const UploadPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisImage, setAnalysisImage] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      setError('Only JPG, JPEG, PNG, TIF, TIFF files are allowed.');
      return;
    }
    setError('');
    setFiles(acceptedFiles);

    if (acceptedFiles.length > 0) {
      const imageUrl = URL.createObjectURL(acceptedFiles[0]);
      setUploadedImageUrl(imageUrl);
      
      // Upload and analyze the image
      try {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', acceptedFiles[0]);
        
        const response = await fetch('http://localhost:8000/predict/', {
          method: 'POST',
          headers: {
            'Accept': 'multipart/form-data',
          },
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Analysis failed');
        }
        const responseData = await response.json();
        if (responseData.image) {
          const { data, content_type, encoding } = responseData.image;
          const base64Image = `data:${content_type};${encoding},${data}`;
          setAnalysisImage(base64Image);
        }
        setAnalysisData(responseData);
        // const data = await response.json();
        // if (data.image) {
        //   setUploadedImageUrl(data.image);
        // }
        // setAnalysisData(data);
      } catch (err) {
        setError('Failed to analyze image. Please try again.');
        console.error('Analysis error:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/jpg': [],
      'image/tiff': [],
      'image/tif': []
    },
    multiple: false
  });

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl);
      }
    };
  }, [uploadedImageUrl]);

  return (
    <div className="p-4 space-y-8">
      <div>
        <h1 className="text-xl font-semibold mb-4">Drag & Drop Image Upload</h1>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-8 text-center rounded-lg cursor-pointer transition ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the image here...</p>
          ) : (
            <p>Drag & drop an image here, or click to select</p>
          )}
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {isLoading && (
          <div className="mt-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2">Analyzing image...</p>
          </div>
        )}
        {files.length > 0 && (
          <div className="mt-4">
            <h2 className="font-medium">Uploaded File:</h2>
            <ul>
              {files.map((file) => (
                <li key={file.name}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Image Comparison Section */}
      {uploadedImageUrl && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Image Comparison</h2>
          <ImageCompare
            image1={uploadedImageUrl}
            image2={analysisImage || '/compare2.png'}
          />
          <p className="text-sm text-gray-600 mt-2">
            Drag the slider to compare your uploaded image with the base map
          </p>
        </div>
      )}

      {/* Analysis Results Section */}
      {analysisData && (
        <div className="mt-8 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
            
            {/* High Heat Areas */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">High Heat Areas</h3>
              <ul className="list-disc pl-5 space-y-1">
                {analysisData.analysis.analysis.high_heat_areas.map((area, index) => (
                  <li key={index}>{area}</li>
                ))}
              </ul>
              <p className="mt-2">
                Risk Level: <span className="font-medium capitalize">{analysisData.analysis.analysis.risk_level}</span>
              </p>
            </div>

            {/* Recommendations */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Immediate Actions</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {analysisData.analysis.recommendations.immediate_actions.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm">Timeline: {analysisData.analysis.recommendations.implementation_timeline.immediate_actions}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Long Term Actions</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {analysisData.analysis.recommendations.long_term_actions.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm">Timeline: {analysisData.analysis.recommendations.implementation_timeline.long_term_actions}</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="font-medium">Expected Temperature Reduction:</p>
                <p>{analysisData.analysis.recommendations.estimated_temperature_reduction}</p>
              </div>
            </div>

            {/* Impact Analysis */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Sustainability Impact</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Environmental Benefits</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {analysisData.analysis.sustainability_impact.environmental_benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Economic Benefits</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {analysisData.analysis.sustainability_impact.economic_benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
