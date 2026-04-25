import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { ConversationItem as ConversationItemType } from '../../api/message';
import { getUserInfo } from '../../store/authStore';

function formatTime(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  return `${d.getMonth() + 1}-${d.getDate()}`;
}

type Props = {
  item: ConversationItemType;
  onPress: () => void;
};

export default function ConversationItem({ item, onPress }: Props) {
  const theme = useTheme();
  const currentUserId = getUserInfo()?.id ?? 0;
  const userAId = Number(item.userAId);
  const userBId = Number(item.userBId);
  const isA = currentUserId === userAId;
  const unread = isA ? item.unreadCountA : item.unreadCountB;
  const otherUserName = item.otherUserName || (isA ? `用户${userBId}` : `用户${userAId}`);
  const otherUserAvatar = item.otherUserAvatar;

  const styles = StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.cardBg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      gap: theme.spacing.sm,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.border,
    },
    body: {
      flex: 1,
      gap: 4,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    name: {
      fontSize: Math.round(15 * theme.fontScale),
      fontWeight: '600',
      color: theme.colors.textMain,
    },
    time: {
      fontSize: Math.round(12 * theme.fontScale),
      color: theme.colors.textSecondary,
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    lastMsg: {
      fontSize: Math.round(13 * theme.fontScale),
      color: theme.colors.textSecondary,
      flex: 1,
    },
    badge: {
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: theme.colors.danger,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 5,
    },
    badgeText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '700',
    },
  });

  return (
    <Pressable style={styles.wrap} onPress={onPress}>
      <Image
        source={
          otherUserAvatar
            ? { uri: otherUserAvatar }
            : { uri: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=default%20user%20avatar&size=128x128' }
        }
        style={styles.avatar}
      />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.name}>{otherUserName}</Text>
          <Text style={styles.time}>{formatTime(item.lastMessageAt)}</Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.lastMsg} numberOfLines={1}>
            {item.lastMessageContent || '暂无消息'}
          </Text>
          {unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
