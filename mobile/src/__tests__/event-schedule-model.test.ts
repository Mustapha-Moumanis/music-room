import {
  dateKey,
  normalizeSearch,
  timeValue,
  withDate,
  withTime,
} from '../features/track-vote/model/event-schedule';

describe('event schedule model', () => {
  it('normalizes accents and surrounding whitespace for search', () => {
    expect(normalizeSearch('  Tétouan  ')).toBe('tetouan');
  });

  it('changes the calendar date without changing the time', () => {
    const source = new Date(2026, 9, 14, 18, 30);
    const changed = withDate(source, '2026-10-20');

    expect(dateKey(changed)).toBe('2026-10-20');
    expect(timeValue(changed)).toBe('18:30');
  });

  it('changes the time without changing the calendar date', () => {
    const source = new Date(2026, 9, 14, 18, 30);
    const changed = withTime(source, '21:00');

    expect(dateKey(changed)).toBe('2026-10-14');
    expect(timeValue(changed)).toBe('21:00');
  });
});
