import React, { useEffect, useState } from 'react';
import tripService from '../services/post_service';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { SavedPost } from '../types';

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

  useEffect(() => {
    if (!userId) return;

    const fetchLocations = async () => {
      try {
        const trips = await tripService.getByUserId(userId);

        // ממיר את הטיולים למיקומים על המפה
        const tripLocations: Location[] = trips
          .filter((trip): trip is SavedPost & { destination: string } => {
            // כאן אפשר להוסיף לוגיקה לחילוץ מיקום מה-destination
            // לדוגמה, שימוש ב-geocoding service
            return trip.destination !== undefined && trip.title !== undefined;
          })
          .map((trip) => ({
            // זה רק לדוגמה - צריך להשתמש בשירות geocoding אמיתי
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

  // פונקציות עזר לחילוץ קואורדינטות מיעד (דוגמה)
  const getLatitudeFromDestination = (destination: string): number => {
    // כאן צריך להשתמש בשירות geocoding אמיתי
    // לדוגמה זו נחזיר ערך קבוע
    return 40;
  };

  const getLongitudeFromDestination = (destination: string): number => {
    // כאן צריך להשתמש בשירות geocoding אמיתי
    // לדוגמה זו נחזיר ערך קבוע
    return 0;
  };

  const defaultCenter: [number, number] = locations.length > 0 ? [locations[0].lat, locations[0].lng] : [40, 0];

  return (
    <MapContainer center={defaultCenter} zoom={locations.length > 0 ? 4 : 2} style={{ height: '400px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
