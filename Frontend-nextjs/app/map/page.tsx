import MapComponent from '@/components/CustomComps/map';

export default function MapPage() {
  return (
    <div className="min-h-screen bg-white">
 
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Interactive Map</h1>
        <MapComponent />
      </div>
    </div>
  );
}