import {
  CheckmarkCircle01Icon,
  Logout03Icon,
  Settings01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal as NativeModal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { useSessionStore } from '../../stores/session.store';
import { colors, radius, shadows, spacing } from '../../theme';
import { AppIcon, type AppIconData } from './app-icon';
import { AppText } from './app-text';
import { Avatar } from './identity-status';
import { pressedFeedback } from './interaction-feedback';

type MenuAnchor = { height: number; width: number; x: number; y: number };
type AccountMenuItem = 'profile' | 'subscription' | 'settings';

const menuGap = 6;
const menuHeight = 225;
const menuMargin = spacing[16];
const menuPreferredWidth = 252;

export function HeaderOverflowMenu({
  accessibilityLabel = 'Open account menu',
  selectedItem,
  testID,
}: {
  accessibilityLabel?: string;
  selectedItem?: AccountMenuItem;
  testID?: string;
}) {
  const router = useRouter();
  const signOut = useSessionStore((state) => state.signOut);
  const triggerRef = useRef<View>(null);
  const { height: viewportHeight, width: viewportWidth } = useWindowDimensions();
  const [anchor, setAnchor] = useState<MenuAnchor | null>(null);
  const [open, setOpen] = useState(false);

  const closeMenu = useCallback(() => setOpen(false), []);

  const menuLayout = useMemo(() => {
    const target = anchor ?? {
      x: viewportWidth - menuMargin - 44,
      y: menuMargin,
      width: 44,
      height: 44,
    };
    const width = Math.min(menuPreferredWidth, viewportWidth - menuMargin * 2);
    const rightAlignedLeft = target.x + target.width - width;
    const left = Math.max(menuMargin, Math.min(rightAlignedLeft, viewportWidth - menuMargin - width));
    const below = target.y + target.height + menuGap;
    const top = below + menuHeight <= viewportHeight - menuMargin
      ? below
      : Math.max(menuMargin, target.y - menuGap - menuHeight);

    return { left, top, width };
  }, [anchor, viewportHeight, viewportWidth]);

  useEffect(() => {
    if (!open || typeof document === 'undefined') return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [closeMenu, open]);

  const openMenu = () => {
    setOpen(true);
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
    });
  };

  const openSettings = () => {
    closeMenu();
    router.push('/settings');
  };

  const openProfile = () => {
    closeMenu();
    router.push('/profile');
  };

  const openSubscription = () => {
    closeMenu();
    router.push('/subscription');
  };

  const logOut = async () => {
    closeMenu();
    try {
      await signOut();
    } finally {
      router.replace('/welcome');
    }
  };

  return <>
    <Pressable
      ref={triggerRef}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      onPress={open ? closeMenu : openMenu}
      style={({ pressed }) => [styles.trigger, pressed && pressedFeedback]}
      testID={testID}
    >
      <View style={styles.avatarRing}>
        <Avatar initials="SH" size="header" />
      </View>
    </Pressable>

    <NativeModal
      animationType="fade"
      onRequestClose={closeMenu}
      transparent
      visible={open}
    >
      <View style={styles.modalRoot}>
        <Pressable
          accessibilityLabel="Close header menu"
          accessibilityRole="button"
          onPress={closeMenu}
          style={StyleSheet.absoluteFill}
          testID="header-overflow-backdrop"
        />
        <View
          accessibilityLabel="Header options"
          accessibilityRole="menu"
          style={[styles.menu, menuLayout]}
          testID="header-overflow-menu"
        >
          <MenuOption
            icon={UserIcon}
            label="Profile"
            onPress={openProfile}
            selected={selectedItem === 'profile'}
            testID="header-overflow-profile"
          />
          <MenuOption
            badge="PRO"
            icon={CheckmarkCircle01Icon}
            label="Subscription"
            onPress={openSubscription}
            selected={selectedItem === 'subscription'}
            testID="header-overflow-subscription"
          />
          <MenuOption
            icon={Settings01Icon}
            label="Settings"
            onPress={openSettings}
            selected={selectedItem === 'settings'}
            testID="header-overflow-settings"
          />
          <View style={styles.divider} />
          <MenuOption
            icon={Logout03Icon}
            label="Sign out"
            onPress={() => { void logOut(); }}
            testID="header-overflow-logout"
          />
        </View>
      </View>
    </NativeModal>
  </>;
}

function MenuOption({ badge, icon, label, onPress, selected = false, testID }: {
  badge?: string;
  icon: AppIconData;
  label: string;
  onPress: () => void;
  selected?: boolean;
  testID: string;
}) {
  return <Pressable
    accessibilityRole="menuitem"
    accessibilityState={{ selected }}
    onPress={onPress}
    style={({ pressed }) => [styles.option, selected && styles.selectedOption, pressed && pressedFeedback]}
    testID={testID}
  >
    <View style={[styles.optionIcon, selected && styles.selectedOptionIcon]}>
      <AppIcon icon={icon} size="compact" tone={selected ? 'active' : 'muted'} />
    </View>
    <AppText variant="navigationLabel" style={styles.optionLabel}>{label}</AppText>
    {badge ? <View style={styles.proBadge}>
      <AppText variant="caption" color="text.onAccent">{badge}</AppText>
    </View> : null}
  </Pressable>;
}

const styles = StyleSheet.create({
  trigger: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  avatarRing: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.action.secondary,
    borderRadius: radius.full,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menu: {
    position: 'absolute',
    padding: spacing[8],
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.card,
    backgroundColor: colors.background.surface,
    ...shadows.floating,
  },
  option: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
    paddingHorizontal: spacing[8],
    borderRadius: radius.medium,
  },
  selectedOption: {
    backgroundColor: colors.category.secondary,
  },
  optionIcon: {
    width: spacing[32],
    height: spacing[32],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.app,
  },
  selectedOptionIcon: {
    backgroundColor: colors.background.surface,
  },
  optionLabel: {
    minWidth: 0,
    flex: 1,
  },
  proBadge: {
    minWidth: 46,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    borderRadius: radius.full,
    backgroundColor: colors.action.secondary,
  },
  divider: {
    height: 1,
    marginVertical: spacing[4],
    backgroundColor: colors.border.subtle,
    opacity: 0.35,
  },
});
