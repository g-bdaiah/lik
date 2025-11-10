import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type Beneficiary } from '../data/mockData';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  status: 'delivered' | 'problem' | 'rescheduled' | 'pending';
  title: string;
  description: string;
  data: Beneficiary;
}

interface GazaMapProps {
  points: MapPoint[];
  onPointClick: (beneficiary: Beneficiary) => void;
  activeFilter?: string;
  className?: string;
}

// Custom marker icons for different statuses
const createCustomIcon = (color: string, status: string) => {
  const svgIcon = `
    <svg width="25" height="25" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12.5" cy="12.5" r="10" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white" opacity="0.8"/>
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker',
    iconSize: [25, 25],
    iconAnchor: [12.5, 12.5],
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered': return '#10b981'; // أخضر
    case 'problem': return '#ef4444';   // أحمر
    case 'rescheduled': return '#f59e0b'; // برتقالي
    case 'pending': return '#3b82f6';   // أزرق
    default: return '#6b7280';          // رمادي
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'delivered': return 'تم التوصيل';
    case 'problem': return 'مشكلة في التسليم';
    case 'rescheduled': return 'معاد جدولتها';
    case 'pending': return 'في الانتظار';
    default: return 'غير محدد';
  }
};

export default function GazaMap({ points, onPointClick, activeFilter = 'all', className = '' }: GazaMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);

  // Gaza Strip coordinates - center point
  const gazaCenter: [number, number] = [31.3547, 34.3088];
  const gazaBounds: [[number, number], [number, number]] = [
    [31.2, 34.2], // Southwest
    [31.6, 34.5]  // Northeast
  ];

  // Filter points based on active filter
  const filteredPoints = activeFilter === 'all' 
    ? points 
    : points.filter(point => point.status === activeFilter);

  useEffect(() => {
    // Custom CSS for markers
    const style = document.createElement('style');
    style.textContent = `
      .custom-marker {
        background: none !important;
        border: none !important;
      }
      .leaflet-popup-content-wrapper {
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      }
      .leaflet-popup-content {
        margin: 0;
        padding: 0;
        border-radius: 12px;
        overflow: hidden;
      }
      .leaflet-popup-tip {
        background: white;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={gazaCenter}
        zoom={11}
       className="z-0"
        style={{ height: '500px', width: '100%', borderRadius: '12px' }}
        maxBounds={gazaBounds}
        maxBoundsViscosity={1.0}
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {filteredPoints.map((point) => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={createCustomIcon(getStatusColor(point.status), point.status)}
          >
            <Popup>
              <div className="p-4 min-w-[250px]" dir="rtl">
                <div className="flex items-center space-x-3 space-x-reverse mb-3">
                  <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: getStatusColor(point.status) }}></div>
                  <h3 className="font-bold text-gray-900">{point.title}</h3>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">الحالة:</span>
                    <span className="font-medium">{getStatusText(point.status)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">رقم الهوية:</span>
                    <span className="font-medium">{point.data.nationalId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الهاتف:</span>
                    <span className="font-medium">{point.data.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">المنطقة:</span>
                    <span className="font-medium">{point.data.detailedAddress.district}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => onPointClick(point.data)}
                  className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  عرض التفاصيل الكاملة
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-xl p-4 shadow-lg border border-gray-200 z-10">
        <h4 className="font-medium text-gray-900 mb-3 text-sm">مفتاح الخريطة</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 space-x-reverse text-xs">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>تم التوصيل ({points.filter(p => p.status === 'delivered').length})</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse text-xs">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>مشكلة في التسليم ({points.filter(p => p.status === 'problem').length})</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse text-xs">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span>معاد جدولتها ({points.filter(p => p.status === 'rescheduled').length})</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse text-xs">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>في الانتظار ({points.filter(p => p.status === 'pending').length})</span>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <button
          onClick={() => map?.setView(gazaCenter, 11)}
          className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          title="العودة لمركز غزة"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}