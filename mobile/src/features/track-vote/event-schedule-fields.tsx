import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { AppText } from '../../components/ui';
import eventContent from '../../content/events.json';
import { createDateOptions, createInitialStart, dateKey, locationOptions, timeOptions, timeValue, withDate, withTime } from './model/event-schedule';
import { SmartSelect } from './components/smart-select';
import { eventScheduleStyles as styles } from './components/event-schedule.styles';

const { radiusOptions } = eventContent.schedule;

export function EventScheduleFields() {
  const initialStart = useMemo(() => createInitialStart(), []);
  const [location, setLocation] = useState(eventContent.schedule.initialLocation);
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(() => new Date(initialStart.getTime() + 3 * 60 * 60 * 1000));
  const [radiusValue, setRadiusValue] = useState('250 m');
  const dateOptions = useMemo(() => createDateOptions(), []);

  const updateStart = (nextStart: Date) => {
    setStart(nextStart);
    if (end <= nextStart) setEnd(new Date(nextStart.getTime() + 3 * 60 * 60 * 1000));
  };

  const updateEnd = (nextEnd: Date) => {
    const minimumEnd = new Date(start.getTime() + 30 * 60 * 1000);
    setEnd(nextEnd < minimumEnd ? minimumEnd : nextEnd);
  };

  const endDateOptions = dateOptions.filter((option) => option.value >= dateKey(start));
  const endTimeOptions = dateKey(start) === dateKey(end)
    ? timeOptions.filter((option) => option.value > timeValue(start))
    : timeOptions;

  return <View style={styles.fields}>
    <SmartSelect
      displayValue={location}
      label="Event location"
      onChange={setLocation}
      options={locationOptions}
      searchable
      testID="event-location-select"
      value={location}
    />

    <View style={styles.scheduleGroup}>
      <AppText variant="bodySmall" color="text.secondary">Starts</AppText>
      <View style={styles.pickerRow}>
        <View style={styles.datePicker}>
          <SmartSelect
            label="Start date"
            onChange={(value) => updateStart(withDate(start, value))}
            options={dateOptions}
            testID="event-start-date-select"
            value={dateKey(start)}
          />
        </View>
        <View style={styles.timePicker}>
          <SmartSelect
            label="Start time"
            onChange={(value) => updateStart(withTime(start, value))}
            options={timeOptions}
            testID="event-start-time-select"
            value={timeValue(start)}
          />
        </View>
      </View>
    </View>

    <View style={styles.scheduleGroup}>
      <AppText variant="bodySmall" color="text.secondary">Ends</AppText>
      <View style={styles.pickerRow}>
        <View style={styles.datePicker}>
          <SmartSelect
            label="End date"
            onChange={(value) => updateEnd(withDate(end, value))}
            options={endDateOptions}
            testID="event-end-date-select"
            value={dateKey(end)}
          />
        </View>
        <View style={styles.timePicker}>
          <SmartSelect
            label="End time"
            onChange={(value) => updateEnd(withTime(end, value))}
            options={endTimeOptions}
            testID="event-end-time-select"
            value={timeValue(end)}
          />
        </View>
      </View>
    </View>

    <AppText variant="caption" color="text.muted">
      Morocco local time · End time always stays after the start.
    </AppText>

    <SmartSelect
      label="Voting radius"
      onChange={setRadiusValue}
      options={radiusOptions}
      testID="event-radius-select"
      value={radiusValue}
    />
  </View>;
}
