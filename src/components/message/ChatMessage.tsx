import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MessageItem } from '../../api/message';
import { useTheme } from '../../theme/useTheme';
import { getUserInfo } from '../../store/authStore';

type Props = {
  message: MessageItem;
  showTime?: boolean;
  myAvatar?: string;
  otherAvatar?: string;
  onImagePress?: (url: string) => void;
};

const DEFAULT_AVATAR =
  'https://neeko-copilot.bytedance.net/api/text2image?prompt=default%20user%20avatar&size=128x128';

function formatTimeLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(now.getTime() - 86400000);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (isYesterday) {
    return `昨天 ${d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export default function ChatMessage({
  message,
  showTime,
  myAvatar,
  otherAvatar,
  onImagePress,
}: Props) {
  const theme = useTheme();
  const currentUserId = getUserInfo()?.id ?? 0;
  const isMe = Number(message.senderId) === currentUserId;

  const avatarSource = isMe
    ? myAvatar
      ? { uri: myAvatar }
      : { uri: DEFAULT_AVATAR }
    : otherAvatar
      ? { uri: otherAvatar }
      : { uri: DEFAULT_AVATAR };

  const styles = StyleSheet.create({
    wrap: {
      marginVertical: showTime ? 8 : 2,
      paddingHorizontal: theme.spacing.lg,
    },
    timeLabel: {
      alignSelf: 'center',
      fontSize: Math.round(11 * theme.fontScale),
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
    },
    rowMe: {
      flexDirection: 'row-reverse',
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.border,
    },
    bubble: {
      maxWidth: '68%',
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: isMe ? theme.colors.primary : theme.colors.cardBg,
    },
    text: {
      fontSize: Math.round(15 * theme.fontScale),
      color: isMe ? '#fff' : theme.colors.textMain,
      lineHeight: Math.round(22 * theme.fontScale),
    },
    image: {
      width: 180,
      height: 180,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.border,
    },
  });

  return (
    <View style={styles.wrap}>
      {showTime && <Text style={styles.timeLabel}>{formatTimeLabel(message.createdAt)}</Text>}
      <View style={[styles.row, isMe && styles.rowMe]}>
        <Image source={avatarSource} style={styles.avatar} />
        <View style={styles.bubble}>
          {message.type === 'image' && message.imageUrl ? (
            <Pressable onPress={() => onImagePress?.(message.imageUrl!)}>
              <Image source={{ uri: message.imageUrl }} style={styles.image} resizeMode="cover" />
            </Pressable>
          ) : (
            <Text style={styles.text}>{message.content}</Text>
          )}
        </View>
      </View>
    </View>
  );
}
