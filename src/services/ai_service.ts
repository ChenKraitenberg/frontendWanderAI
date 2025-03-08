// // services/ai_service.ts
import axios from 'axios';
import { PostPreferences, GeneratedPost } from '../types';

const token = import.meta.env.VITE_HF_API_TOKEN;
const MODEL_URL = 'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1';

console.log('Token loaded:', !!import.meta.env.VITE_HF_API_TOKEN);
console.log('Token first 5 chars:', import.meta.env.VITE_HF_API_TOKEN?.substring(0, 5));
console.log('Hugging Face API Token:', token);

const createPrompt = (preferences: PostPreferences): string => {
  return `Create a detailed ${preferences.duration}-day itinerary for ${preferences.destination}.
Travel style: ${preferences.category}
Budget level: ${preferences.duration}
Interests: ${preferences.interests.join(', ')}

Format the response exactly as follows:
TITLE: [A catchy title for the trip]
DESCRIPTION: [A brief overview of the trip in 2-3 sentences]

Then for each day, use this exact format:
Day 1:
Morning:
- [Detailed morning activity]
- [Additional morning activity if applicable]

Afternoon:
- [Detailed afternoon activity]
- [Additional afternoon activity if applicable]

Evening:
- [Detailed evening activity]
- [Additional evening activity if applicable]

[Repeat the same format for each day]

Be specific with locations, restaurant names, and activities.`;
};

const parseGeneratedText = (text: string, preferences: PostPreferences): GeneratedPost => {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  let title = '';
  let description = '';
  let currentDay: string[] = [];
  const days: string[] = [];
  let currentSection = '';

  lines.forEach((line) => {
    if (line.toLowerCase().startsWith('title:')) {
      title = line.replace(/title:/i, '').trim();
    } else if (line.toLowerCase().startsWith('description:')) {
      description = line.replace(/description:/i, '').trim();
    } else if (line.toLowerCase().startsWith('day')) {
      if (currentDay.length > 0) {
        days.push(currentDay.join('\n'));
      }
      currentDay = [line];
      currentSection = '';
    } else if (['morning:', 'afternoon:', 'evening:'].some((s) => line.toLowerCase().startsWith(s))) {
      currentSection = line;
      currentDay.push(currentSection);
    } else if (line.startsWith('-') && currentDay.length > 0) {
      const activity = line.replace('-', '').trim();
      currentDay.push(`- ${activity}`);
    } else if (currentDay.length > 0 && currentSection) {
      const lastLine = currentDay[currentDay.length - 1];
      if (lastLine.startsWith('-')) {
        currentDay[currentDay.length - 1] = `${lastLine} ${line}`;
      } else {
        currentDay.push(`- ${line}`);
      }
    }
  });

  if (currentDay.length > 0) {
    days.push(currentDay.join('\n'));
  }

  return {
    title: title || 'Your Custom Trip',
    description: description || 'A personalized travel itinerary.',
    itinerary: days,
    imageUrl: '/api/placeholder/800/400',
    destination: preferences.destination,
    duration: preferences.duration,
    category: preferences.category,
  };
};

const generateTrip = async (preferences: PostPreferences): Promise<GeneratedPost> => {
  try {
    const response = await axios.post(
      MODEL_URL,
      {
        inputs: createPrompt(preferences),
        parameters: {
          max_length: 1000,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response.data;
    const generatedText = Array.isArray(data) ? data[0].generated_text : data.generated_text;
    return parseGeneratedText(generatedText, preferences);
  } catch (error) {
    console.error('Error in generateTrip:', error);
    throw error;
  }
};

export default {
  generateTrip,
};
