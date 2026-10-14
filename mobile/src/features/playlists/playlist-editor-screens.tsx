import { Add01Icon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Animated, PanResponder, Pressable, View } from 'react-native';

import { AppIcon, AppText, TrackRow } from '../../components/ui';
import { pressedFeedback } from '../../components/ui/interaction-feedback';
import playlistContent from '../../content/playlists.json';
import { goBackOrReplace } from '../../lib/navigation';
import { SectionRow } from '../track-vote/track-vote-ui';
import { usePlaylistEditor } from './hooks/use-playlist-editor';
import { type PlaylistTrack } from './model/playlist-data';
import { playlistScreenStyles as styles, removeActionWidth, reorderDistance, reorderThreshold } from './playlist-screen.styles';
import { PlaylistHeader, PlaylistScreen, RoleBanner } from './playlist-ui';

function EditorTracks({ collaborator = false }: { collaborator?: boolean }) {
  const { moveTrack, removeTrack, tracks } = usePlaylistEditor(collaborator);
  return <>
    <SectionRow title={`${tracks.length} tracks`} />
    <AppText variant="caption" color="text.muted">{playlistContent.editor.instructions}</AppText>
    {tracks.map((track, index) => <SwipeableEditorTrack
      key={track.id}
      count={tracks.length}
      index={index}
      onMove={(direction) => moveTrack(index, direction)}
      onRemove={() => removeTrack(track.id)}
      track={track}
    />)}
  </>;
}

function SwipeableEditorTrack({ count, index, onMove, onRemove, track }: {
  count: number;
  index: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  track: PlaylistTrack;
}) {
  const [horizontalOffset] = useState(() => new Animated.Value(0));
  const [verticalOffset] = useState(() => new Animated.Value(0));
  const [dragging, setDragging] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  const horizontalGesture = useMemo(() => {
    const horizontalStart = removeOpen ? -removeActionWidth : 0;
    const settleHorizontal = (open: boolean) => {
      setRemoveOpen(open);
      Animated.spring(horizontalOffset, {
        toValue: open ? -removeActionWidth : 0,
        useNativeDriver: true,
      }).start();
    };

    return PanResponder.create({
      onMoveShouldSetPanResponder: (_event, gesture) => Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderGrant: () => {
        horizontalOffset.stopAnimation();
        horizontalOffset.setValue(horizontalStart);
      },
      onPanResponderMove: (_event, gesture) => horizontalOffset.setValue(Math.max(-removeActionWidth, Math.min(0, horizontalStart + gesture.dx))),
      onPanResponderRelease: (_event, gesture) => settleHorizontal(horizontalStart + gesture.dx < -removeActionWidth / 2 || gesture.vx < -0.35),
      onPanResponderTerminate: () => settleHorizontal(false),
    });
  }, [horizontalOffset, removeOpen]);

  const resetVerticalPosition = useCallback(() => Animated.spring(verticalOffset, {
    damping: 18,
    stiffness: 220,
    toValue: 0,
    useNativeDriver: true,
  }).start(() => setDragging(false)), [verticalOffset]);

  const finishReorder = useCallback((direction: -1 | 1, releasedOffset = 0) => {
    const canMove = direction === -1 ? index > 0 : index < count - 1;
    if (!canMove) {
      resetVerticalPosition();
      return;
    }
    onMove(direction);
    verticalOffset.setValue(releasedOffset - direction * reorderDistance);
    resetVerticalPosition();
  }, [count, index, onMove, resetVerticalPosition, verticalOffset]);

  const verticalGesture = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_event, gesture) => Math.abs(gesture.dy) > 4,
    onPanResponderGrant: () => {
      verticalOffset.stopAnimation();
      setDragging(true);
    },
    onPanResponderMove: (_event, gesture) => verticalOffset.setValue(Math.max(-96, Math.min(96, gesture.dy))),
    onPanResponderTerminationRequest: () => false,
    onPanResponderRelease: (_event, gesture) => {
      if (gesture.dy <= -reorderThreshold) finishReorder(-1, gesture.dy);
      else if (gesture.dy >= reorderThreshold) finishReorder(1, gesture.dy);
      else resetVerticalPosition();
    },
    onPanResponderTerminate: resetVerticalPosition,
  }), [finishReorder, resetVerticalPosition, verticalOffset]);

  const removeWithAnimation = () => Animated.timing(horizontalOffset, {
    duration: 180,
    toValue: -500,
    useNativeDriver: true,
  }).start(onRemove);

  const accessibilityActions = [
    ...(index > 0 ? [{ name: 'decrement' as const, label: 'Move up' }] : []),
    ...(index < count - 1 ? [{ name: 'increment' as const, label: 'Move down' }] : []),
  ];

  return <Animated.View style={[
    styles.swipeTrack,
    dragging && styles.draggingTrack,
    { transform: [{ translateY: verticalOffset }, { scale: dragging ? 1.015 : 1 }] },
  ]}>
    <Pressable accessibilityLabel={`Remove ${track.title}`} accessibilityRole="button" onPress={removeWithAnimation} style={({ pressed }) => [styles.removeAction, pressed && pressedFeedback]}>
      <AppText variant="buttonLabel" color="text.onAccent">Remove</AppText>
    </Pressable>
    <Animated.View
      {...horizontalGesture.panHandlers}
      style={[styles.swipeForeground, { transform: [{ translateX: horizontalOffset }] }]}
      testID={`editor-row-${track.id}`}
    >
      <View>
        <TrackRow
          {...track}
          dragHandleProps={{
            accessibilityActions,
            accessibilityLabel: `Reorder ${track.title}`,
            onAccessibilityAction: (event) => {
              if (event.nativeEvent.actionName === 'decrement') finishReorder(-1);
              if (event.nativeEvent.actionName === 'increment') finishReorder(1);
            },
            ...verticalGesture.panHandlers,
          }}
          mode="dragging"
          status={track.id === 'night-drive' ? 'Nada is moving this track' : undefined}
        />
      </View>
    </Animated.View>
  </Animated.View>;
}

function InlineIconAction({ icon = 'add', label, onPress }: { icon?: 'add' | 'members'; label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.inlineAction, pressed && pressedFeedback]}><AppIcon icon={icon === 'add' ? Add01Icon : UserGroupIcon} size="standard" /><AppText variant="navigationLabel" color="action.secondary">{label}</AppText></Pressable>;
}

export function OwnerPlaylistEditorScreen() {
  const router = useRouter();
  return <PlaylistScreen showMiniPlayer showNavigation testID="owner-playlist-editor-screen">
    <PlaylistHeader title="Edit playlist" onBack={() => goBackOrReplace(router, '/playlists/details')} />
    <RoleBanner role="owner" title="You're the owner" />
    <View style={styles.editorTools}>
      <InlineIconAction label="Add track" onPress={() => router.push('/playlists/add-track')} />
      <InlineIconAction label="Members" icon="members" onPress={() => router.push('/playlists/members')} />
    </View>
    <EditorTracks />
    <AppText variant="caption" color="text.muted" style={styles.note}>{playlistContent.editor.ownerSync}</AppText>
  </PlaylistScreen>;
}

export function CollaboratorPlaylistEditorScreen() {
  const router = useRouter();
  return <PlaylistScreen showMiniPlayer showNavigation testID="collaborator-playlist-editor-screen">
    <PlaylistHeader title="Edit playlist" action onBack={() => goBackOrReplace(router, '/playlists/mine')} />
    <RoleBanner role="collaborator" title="You can edit" />
    <AppText variant="caption" color="text.muted" style={styles.note}>{playlistContent.editor.collaboratorSync}</AppText>
    <View style={styles.editorTools}>
      <InlineIconAction label="Add track" onPress={() => router.push('/playlists/add-track')} />
    </View>
    <EditorTracks collaborator />
    <AppText variant="caption" color="text.muted" style={styles.note}>{playlistContent.editor.collaboratorPermissions}</AppText>
  </PlaylistScreen>;
}
