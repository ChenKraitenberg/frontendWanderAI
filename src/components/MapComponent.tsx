import React, { useEffect, useState } from 'react';
import tripService from '../services/post_service';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { SavedPost } from '../types';
import L from 'leaflet';  // Import Leaflet to handle marker icon

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

interface MapComponentProps {
  userId: string;
}

interface Location {
  lat: number;
  lng: number;
  title: string;
  destination: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ userId }) => {
  const [locations, setLocations] = useState<Location[]>([]);

  // Fix for default marker icon which might not load correctly
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchLocations = async () => {
      try {
        const trips = await tripService.getByUserId(userId);

        // Map trips to locations
        const tripLocations: Location[] = trips
          .filter((trip:any): trip is SavedPost & { destination: string } => {
            // Ensure destination is defined and not empty
            return trip.destination !== undefined && trip.destination.trim() !== '';
          })
          .map((trip:any) => ({
            // Use real geocoding service in production
            lat: getLatitudeFromDestination(trip.destination),
            lng: getLongitudeFromDestination(trip.destination),
            title: trip.title,
            destination: trip.destination,
          }));

        setLocations(tripLocations);
      } catch (error) {
        console.error('Failed to fetch locations:', error);
      }
    };

    fetchLocations();
  }, [userId]);

  // Mock functions for geocoding - replace with real service in production
  const getLatitudeFromDestination = (destination: string): number => {
    // Add real geocoding logic here
    // This is a placeholder that returns predefined coordinates for some destinations
    const coordinateMap: { [key: string]: number } = {
      'Paris': 48.8566,
      'New York': 40.7128,
      'Tokyo': 35.6762,
      'London': 51.5074,
      'Sydney': -33.8688,
      // Add more destinations as needed
    };

    // Default to a random coordinate if destination not found
    return coordinateMap[destination] || (Math.random() * 180 - 90);
  };

  const getLongitudeFromDestination = (destination: string): number => {
    // Add real geocoding logic here
    const coordinateMap: { [key: string]: number } = {
      'Paris': 2.3522,
      'New York': -74.0060,
      'Tokyo': 139.6503,
      'London': -0.1278,
      'Sydney': 151.2093,
      // Add more destinations as needed
    };

    // Default to a random coordinate if destination not found
    return coordinateMap[destination] || (Math.random() * 360 - 180);
  };

  const defaultCenter: [number, number] = locations.length > 0 
    ? [locations[0].lat, locations[0].lng] 
    : [0, 0];

  return (
    <MapContainer 
      center={defaultCenter} 
      zoom={locations.length > 0 ? 3 : 2} 
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer 
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {locations.map((loc, index) => (
        <Marker key={index} position={[loc.lat, loc.lng]}>
          <Popup>
            <div>
              <h5>{loc.title}</h5>
              <p>{loc.destination}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;