'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

// Define the draw event type
interface DrawEvent extends L.LeafletEvent {
  layer: L.Layer;
  layerType: string;
}

const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const [hasDrawings, setHasDrawings] = useState(false);
  const [selectedModel, setSelectedModel] = useState('model1');

  useEffect(() => {
    // Check if map is already initialized or if container is not ready
    if (!mapRef.current || mapInstanceRef.current) {
      return;
    }

    try {
      // Initialize the map
      const map = L.map(mapRef.current).setView([25.5941, 85.1376], 12);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Create drawn items layer
      const drawnItems = new L.FeatureGroup();
      drawnItemsRef.current = drawnItems;
      map.addLayer(drawnItems);

      // Initialize draw control
      const drawControl = new L.Control.Draw({
        draw: {
          polyline: {},
          polygon: {},
          rectangle: {},
          circle: {},
          marker: {},
          circlemarker: {}
        },
        edit: {
          featureGroup: drawnItems
        }
      });

      map.addControl(drawControl);

      // Handle drawing events with correct type
      map.on('draw:created', ((e: DrawEvent) => {
        if (e.layer) {
          drawnItems.addLayer(e.layer);
          setHasDrawings(true);
        }
      }) as L.LeafletEventHandlerFn);

      map.on('draw:deleted', (() => {
        setHasDrawings(drawnItems.getLayers().length > 0);
      }) as L.LeafletEventHandlerFn);

      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          drawnItemsRef.current = null;
          setHasDrawings(false);
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, []);

  const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(event.target.value);
    // Here you can add logic to handle model change
    console.log('Selected model:', event.target.value);
  };

  const getLiveSegmentation = async () => {
    if (!drawnItemsRef.current) return;

    const data = drawnItemsRef.current.toGeoJSON();

    try {
      const response = await fetch('http://localhost:8000/get-live-segmentation/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('Segmentation result received:', blob);
    } catch (error) {
      console.error('Error sending GeoJSON to backend:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <label htmlFor="model-select" className="font-medium text-gray-700">
          Select Model:
        </label>
        <select
          id="model-select"
          value={selectedModel}
          onChange={handleModelChange}
          className="block w-48 rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="model1">Resnet 34</option>
          <option value="model2">Resnet 50</option>
        </select>
      </div>
      
      <div ref={mapRef} className="h-96 w-full border border-gray-300 rounded" />
      
      <button
        onClick={getLiveSegmentation}
        className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        disabled={!hasDrawings}
      >
        Get Live Segmentation
      </button>
    </div>
  );
};

export default MapComponent;