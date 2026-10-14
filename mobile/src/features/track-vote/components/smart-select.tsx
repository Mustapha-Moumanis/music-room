import { CheckmarkCircle01Icon } from '@hugeicons/core-free-icons';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Modal as NativeModal, FlatList, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { AppIcon, AppText, SearchField, Select } from '../../../components/ui';
import { pressedFeedback } from '../../../components/ui/interaction-feedback';
import { useEscapeKey } from '../../../lib/use-escape-key';
import { spacing } from '../../../theme';
import { normalizeSearch, type SmartOption } from '../model/event-schedule';
import { eventScheduleStyles as styles } from './event-schedule.styles';

type MenuAnchor = { height: number; width: number; x: number; y: number };
const menuGap = 6;
const menuMargin = spacing[16];

export function SmartSelect({
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

  useEscapeKey(open, closeMenu);

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
