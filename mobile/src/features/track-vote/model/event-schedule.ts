import eventContent from '../../../content/events.json';
import { moroccoPlaces } from '../../../mocks/morocco-places';

export type SmartOption = {
  label: string;
  meta?: string;
  value: string;
};

const { monthLabels, weekdayLabels } = eventContent.schedule;

export function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim();
}

export function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateFromKey(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function withDate(source: Date, value: string) {
  const date = dateFromKey(value);
  date.setHours(source.getHours(), source.getMinutes(), 0, 0);
  return date;
}

export function withTime(source: Date, value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date(source);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function timeValue(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function createInitialStart() {
  const start = new Date(Date.now() + 60 * 60 * 1000);
  start.setSeconds(0, 0);
  const remainder = start.getMinutes() % 30;
  if (remainder) start.setMinutes(start.getMinutes() + 30 - remainder);
  return start;
}

export function createDateOptions(days = 120): SmartOption[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    const relative = index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : weekdayLabels[date.getDay()];
    return {
      label: `${relative} · ${monthLabels[date.getMonth()]} ${date.getDate()}`,
      meta: String(date.getFullYear()),
      value: dateKey(date),
    };
  });
}

export const timeOptions: SmartOption[] = Array.from({ length: 48 }, (_, index) => {
  const hours = Math.floor(index / 2);
  const minutes = index % 2 ? 30 : 0;
  const value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  return { label: value, value };
});

export const locationOptions: SmartOption[] = moroccoPlaces.map(({ name, region }) => ({
  label: name,
  meta: region,
  value: `${name}, Morocco`,
}));
