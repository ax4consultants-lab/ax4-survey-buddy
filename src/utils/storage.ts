import { Survey, Room, Item, SurveyData } from '@/types/survey';

const STORAGE_KEYS = {
  SURVEYS: 'ax4_surveys',
  ROOMS: 'ax4_rooms',
  ITEMS: 'ax4_items',
  PHOTOS: 'ax4_photos',
} as const;

// Survey operations
export const saveSurvey = (survey: Survey): void => {
  const surveys = getSurveys();
  const existingIndex = surveys.findIndex(s => s.surveyId === survey.surveyId);
  
  if (existingIndex >= 0) {
    surveys[existingIndex] = { ...survey, updatedAt: new Date().toISOString() };
  } else {
    surveys.push(survey);
  }
  
  localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(surveys));
};

export const getSurveys = (): Survey[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SURVEYS);
  return data ? JSON.parse(data) : [];
};

export const getSurveyById = (surveyId: string): Survey | undefined => {
  const surveys = getSurveys();
  return surveys.find(s => s.surveyId === surveyId);
};

// Room operations
export const saveRoom = (room: Room): void => {
  const rooms = getRooms();
  const existingIndex = rooms.findIndex(r => r.roomId === room.roomId);
  
  if (existingIndex >= 0) {
    rooms[existingIndex] = room;
  } else {
    rooms.push(room);
  }
  
  localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
};

export const getRooms = (): Room[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ROOMS);
  return data ? JSON.parse(data) : [];
};

export const getRoomsBySurveyId = (surveyId: string): Room[] => {
  const rooms = getRooms();
  return rooms.filter(r => r.surveyId === surveyId);
};

// Item operations
export const saveItem = (item: Item): void => {
  const items = getItems();
  const existingIndex = items.findIndex(i => i.itemId === item.itemId);
  
  if (existingIndex >= 0) {
    items[existingIndex] = item;
  } else {
    items.push(item);
  }
  
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
};

export const getItems = (): Item[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ITEMS);
  return data ? JSON.parse(data) : [];
};

export const getItemsByRoomId = (roomId: string): Item[] => {
  const items = getItems();
  return items.filter(i => i.roomId === roomId);
};

export const getItemsBySurveyId = (surveyId: string): Item[] => {
  const rooms = getRoomsBySurveyId(surveyId);
  const roomIds = rooms.map(r => r.roomId);
  const items = getItems();
  return items.filter(i => roomIds.includes(i.roomId));
};

// Photo operations
export const savePhoto = (photoId: string, dataUrl: string): void => {
  localStorage.setItem(`${STORAGE_KEYS.PHOTOS}_${photoId}`, dataUrl);
};

export const getPhoto = (photoId: string): string | null => {
  return localStorage.getItem(`${STORAGE_KEYS.PHOTOS}_${photoId}`);
};

// Complete survey data
export const getSurveyData = (surveyId: string): SurveyData | null => {
  const survey = getSurveyById(surveyId);
  if (!survey) return null;
  
  const rooms = getRoomsBySurveyId(surveyId);
  const items = getItemsBySurveyId(surveyId);
  
  return { survey, rooms, items };
};

// Generate unique IDs
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};