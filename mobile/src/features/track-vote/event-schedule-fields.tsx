import { CheckmarkCircle01Icon } from '@hugeicons/core-free-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal as NativeModal,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { AppIcon, AppText, SearchField, Select } from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import eventContent from '../../content/events.json';
import { moroccoPlaces } from '../../mocks/morocco-places';
import { colors, radius, spacing } from '../../theme';

type SmartOption = {
  label: string;
  meta?: string;
  value: string;
};

type MenuAnchor = { height: number; width: number; x: number; y: number };

const menuGap = 6;
const menuMargin = spacing[16];
const { monthLabels, radiusOptions, weekdayLabels } = eventContent.schedule;

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim();
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateFromKey(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function withDate(source: Date, value: string) {
  const date = dateFromKey(value);
  date.setHours(source.getHours(), source.getMinutes(), 0, 0);
  return date;
}

function withTime(source: Date, value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date(source);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function timeValue(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function createInitialStart() {
  const start = new Date(Date.now() + 60 * 60 * 1000);
  start.setSeconds(0, 0);
  const remainder = start.getMinutes() % 30;
  if (remainder) start.setMinutes(start.getMinutes() + 30 - remainder);
  return start;
}

function createDateOptions(days = 120): SmartOption[] {
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

const timeOptions: SmartOption[] = Array.from({ length: 48 }, (_, index) => {
  const hours = Math.floor(index / 2);
  const minutes = index % 2 ? 30 : 0;
  const value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  return { label: value, value };
});

const locationOptions: SmartOption[] = moroccoPlaces.map(({ name, region }) => ({
  label: name,
  meta: region,
  value: `${name}, Morocco`,
}));

function SmartSelect({
  displayValue,
  label,
  onChange,
  options,
  searchable = false,
  testID,
  value,
}: {
  displayValue?: string;
  label: string;
  onChange: (value: string) => void;
  options: SmartOption[];
  searchable?: boolean;
  testID: string;
  value: string;
}) {
  const triggerRef = useRef<View>(null);
  const { height: viewportHeight, width: viewportWidth } = useWindowDimensions();
  const [anchor, setAnchor] = useState<MenuAnchor | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const closeMenu = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  const openMenu = () => {
    setOpen(true);
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
    });
  };

  useEffect(() => {
    if (!open || typeof document === 'undefined') return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [closeMenu, open]);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);
    if (!normalizedQuery) return options;
    return options.filter((option) => normalizeSearch(`${option.label} ${option.meta ?? ''}`).includes(normalizedQuery));
  }, [options, query]);

  const trimmedQuery = query.trim();
  const hasExactLocation = options.some((option) => normalizeSearch(option.label) === normalizeSearch(trimmedQuery));
  const customValue = trimmedQuery
    ? `${trimmedQuery}${/morocco/i.test(trimmedQuery) ? '' : ', Morocco'}`
    : '';

  const target = anchor ?? {
    x: menuMargin,
    y: menuMargin,
    width: viewportWidth - menuMargin * 2,
    height: spacing[48],
  };
  const menuWidth = Math.min(Math.max(target.width, 260), viewportWidth - menuMargin * 2);
  const desiredHeight = searchable ? 360 : Math.min(options.length * 52 + spacing[8], 320);
  const menuHeight = Math.min(desiredHeight, viewportHeight - menuMargin * 2);
  const left = Math.max(menuMargin, Math.min(target.x, viewportWidth - menuMargin - menuWidth));
  const below = target.y + target.height + menuGap;
  const top = below + menuHeight <= viewportHeight - menuMargin
    ? below
    : Math.max(menuMargin, target.y - menuGap - menuHeight);

  const choose = (nextValue: string) => {
    onChange(nextValue);
    closeMenu();
  };

  return <>
    <View ref={triggerRef} collapsable={false} style={styles.triggerAnchor}>
      <Select
        expanded={open}
        label={label}
        value={displayValue ?? options.find((option) => option.value === value)?.label ?? value}
        onPress={open ? closeMenu : openMenu}
        testID={testID}
      />
    </View>

    <NativeModal animationType="fade" onRequestClose={closeMenu} transparent visible={open}>
      <View style={styles.modalRoot}>
        <Pressable
          accessibilityLabel={`Close ${label} options`}
          accessibilityRole="button"
          onPress={closeMenu}
          style={StyleSheet.absoluteFill}
          testID={`${testID}-backdrop`}
        />
        <View
          accessibilityLabel={`${label} options`}
          accessibilityRole="radiogroup"
          style={[styles.menu, { height: menuHeight, left, top, width: menuWidth }]}
          testID={`${testID}-menu`}
        >
          {searchable ? <View style={styles.searchWrap}>
            <SearchField
              autoFocus
              onChangeText={setQuery}
              placeholder="Search any place in Morocco"
              testID={`${testID}-search`}
              value={query}
            />
          </View> : null}
          <FlatList
            data={filteredOptions}
            extraData={value}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(option) => option.value}
            ListHeaderComponent={searchable && trimmedQuery && !hasExactLocation ? <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: value === customValue }}
              onPress={() => choose(customValue)}
              style={({ pressed }) => [styles.option, styles.customOption, pressed && pressedFeedback]}
              testID={`${testID}-custom-option`}
            >
              <View style={styles.optionCopy}>
                <AppText variant="bodySmall" color="action.secondary">Use “{trimmedQuery}”</AppText>
                <AppText variant="caption" color="text.muted">Custom place in Morocco</AppText>
              </View>
            </Pressable> : null}
            renderItem={({ item: option }) => {
              const selected = option.value === value;
              return <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => choose(option.value)}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.selectedOption,
                  pressed && pressedFeedback,
                ]}
                testID={`${testID}-option-${option.value}`}
              >
                <View style={styles.optionCopy}>
                  <AppText variant="bodySmall" color={selected ? 'action.secondary' : 'text.primary'}>{option.label}</AppText>
                  {option.meta ? <AppText variant="caption" color="text.muted">{option.meta}</AppText> : null}
                </View>
                {selected ? <AppIcon icon={CheckmarkCircle01Icon} size="compact" tone="secondary" /> : null}
              </Pressable>;
            }}
            showsVerticalScrollIndicator={false}
            style={styles.optionsScroll}
          />
        </View>
      </View>
    </NativeModal>
  </>;
}

export function EventScheduleFields() {
  const initialStart = useMemo(createInitialStart, []);
  const [location, setLocation] = useState(eventContent.schedule.initialLocation);
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(() => new Date(initialStart.getTime() + 3 * 60 * 60 * 1000));
  const [radiusValue, setRadiusValue] = useState('250 m');
  const dateOptions = useMemo(createDateOptions, []);

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

const styles = StyleSheet.create({
  fields: {
    width: '100%',
    gap: spacing[16],
  },
  triggerAnchor: {
    width: '100%',
  },
  scheduleGroup: {
    width: '100%',
    gap: spacing[8],
  },
  pickerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[8],
  },
  datePicker: {
    minWidth: 0,
    flex: 1.45,
  },
  timePicker: {
    minWidth: 0,
    flex: 1,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menu: {
    position: 'absolute',
    overflow: 'hidden',
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.medium,
    backgroundColor: colors.background.surface,
    elevation: 8,
  },
  searchWrap: {
    padding: spacing[4],
  },
  optionsScroll: {
    flex: 1,
  },
  option: {
    width: '100%',
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
    borderRadius: radius.small,
  },
  customOption: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  selectedOption: {
    backgroundColor: colors.background.app,
  },
  optionCopy: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
});
