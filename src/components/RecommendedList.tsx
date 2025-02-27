import { FC } from 'react';

const RecommendedList: FC = () => {
  const recommendedTrips = [
    { id: 1, title: 'Mountain Escape', location: 'Alps', date: 'July 18', image: '/path/to/image1.jpg' },
    { id: 2, title: 'Beach Paradise', location: 'Maldives', date: 'August 2', image: '/path/to/image2.jpg' },
  ];

  return (
    <div className="d-flex overflow-auto">
      {recommendedTrips.map((trip) => (
        <div key={trip.id} className="card m-2" style={{ width: '18rem' }}>
          <img src={trip.image} className="card-img-top" alt={trip.title} />
          <div className="card-body">
            <h5 className="card-title">{trip.title}</h5>
            <p className="card-text">
              {trip.location} - {trip.date}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecommendedList;
