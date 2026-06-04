import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Schedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await axios.get('/api/schedule');
        setSchedule(res.data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  // Grouper par date
  const groupedByDate = schedule.reduce((acc, item) => {
    const date = formatDate(item.start_time);
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-accent">Grille TV</h1>

      {Object.entries(groupedByDate).map(([date, items]) => (
        <div key={date} className="mb-12">
          <h2 className="text-xl font-bold mb-4 text-text">{date}</h2>
          <div className="space-y-3">
            {items.map(item => (
              <Link key={item.id} to={`/video/${item.id}`}>
                <div className="bg-primary rounded-lg p-4 hover:bg-gray-700 transition cursor-pointer border border-gray-700">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-accent">
                          {formatTime(item.start_time)} - {formatTime(item.end_time)}
                        </span>
                        {item.is_live && (
                          <span className="badge bg-red-600">EN DIRECT</span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted mb-2">{item.channel}</p>
                      <p className="text-sm text-gray-400">{item.description}</p>
                    </div>
                    <div className="w-32 h-20 bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">📺</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Schedule;
