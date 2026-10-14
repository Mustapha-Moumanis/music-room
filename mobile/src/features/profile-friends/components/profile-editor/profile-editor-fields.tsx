import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { createContext, type ComponentProps, type PropsWithChildren, type ReactNode, useContext, useRef } from 'react';
import { Pressable, View } from 'react-native';

import { AppIcon, AppText, TextField } from '../../../../components/ui';
import { pressedFeedback } from '../../../../components/ui/interaction-feedback';
import type { SemanticColorRole } from '../../../../theme';
import { type EditableVisibility, type VisibilityAnchor, type VisibilityField } from '../../model/profile-editor';
import { profileEditorStyles as styles } from './profile-editor.styles';

const ActiveVisibilityContext = createContext<VisibilityField | null>(null);

const visibilityLabels: Record<EditableVisibility, string> = { public: 'Public', friends: 'Friends', private: 'Private' };
const visibilityColors: Record<EditableVisibility, SemanticColorRole> = { public: 'action.secondary', friends: 'text.primary', private: 'action.primary' };

export function ActiveVisibilityProvider({ children, value }: PropsWithChildren<{ value: VisibilityField | null }>) {
  return <ActiveVisibilityContext.Provider value={value}>{children}</ActiveVisibilityContext.Provider>;
}

export function EditorSection({ children, subtitle, title }: {
  children: ReactNode;
  subtitle: string;
  title: string;
}) {
  return <View style={styles.section}>
    <View style={styles.sectionHeading}>
      <AppText variant="h5">{title}</AppText>
      <AppText variant="caption" color="text.muted">{subtitle}</AppText>
    </View>
    {children}
  </View>;
}

export function ProfileEditField({
  field,
  label,
  onOpenVisibility,
  visibility,
  ...inputProps
}: Pick<
  ComponentProps<typeof TextField>,
  'autoCapitalize' | 'keyboardType' | 'multiline' | 'onChangeText' | 'value'
> & {
  field: VisibilityField;
  label: string;
  onOpenVisibility: (field: VisibilityField, anchor?: VisibilityAnchor) => void;
  visibility: EditableVisibility;
}) {
  return <View style={styles.field}>
    <FieldHeader
      field={field}
      label={label}
      visibility={visibility}
      onOpenVisibility={onOpenVisibility}
    />
    <TextField {...inputProps} label="" />
  </View>;
}

export function FieldHeader({ field, label, onOpenVisibility, visibility }: {
  field: VisibilityField;
  label: string;
  onOpenVisibility: (field: VisibilityField, anchor?: VisibilityAnchor) => void;
  visibility: EditableVisibility;
}) {
  return <View style={styles.fieldHeader}>
    <AppText variant="bodySmall" color="text.secondary">{label}</AppText>
    <VisibilityControl
      field={field}
      label={label}
      value={visibility}
      onOpen={onOpenVisibility}
    />
  </View>;
}

export function VisibilityControl({ field, label, onOpen, value }: {
  field: VisibilityField;
  label: string;
  onOpen: (field: VisibilityField, anchor?: VisibilityAnchor) => void;
  value: EditableVisibility;
}) {
  const activeVisibility = useContext(ActiveVisibilityContext);
  const controlRef = useRef<View>(null);
  const visibleLabel = visibilityLabels[value];
  const expanded = activeVisibility === field;

  const handleOpen = () => {
    onOpen(field);
    controlRef.current?.measureInWindow((x, y, width, height) => {
      onOpen(field, { x, y, width, height });
    });
  };

  return <Pressable
    ref={controlRef}
    accessibilityLabel={`Change ${label} visibility, currently ${visibleLabel}`}
    accessibilityRole="combobox"
    accessibilityState={{ expanded }}
    onPress={handleOpen}
    style={({ pressed }) => [
      styles.visibilityControl,
      expanded && styles.visibilityControlExpanded,
      pressed && pressedFeedback,
    ]}
  >
    <AppText variant="caption" color={expanded ? 'text.primary' : visibilityColors[value]}>{visibleLabel}</AppText>
    <AppIcon icon={ArrowDown01Icon} size="compact" tone={expanded ? 'default' : 'muted'} />
  </Pressable>;
}
