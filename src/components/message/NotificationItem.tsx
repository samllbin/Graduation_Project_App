import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { NotificationItem as NotificationItemType } from '../../api/notification';
import { useTheme } from '../../theme/useTheme';

type Props = {
  item: NotificationItemType;
  onPress: () => void;
  onAvatarPress?: () => void;
};

function getNotificationText(item: NotificationItemType) {
  const { senderName, count, type } = item;
  if (type === 'like') {
    return count > 1 ? `${senderName} 等 ${count} 人点赞了你的帖子` : `${senderName} 点赞了你的帖子`;
  }
  return count > 1 ? `${senderName} 等 ${count} 人评论了你的帖子` : `${senderName} 评论了你的帖子`;
}

export default function NotificationItem({ item, onPress, onAvatarPress }: Props) {
  const theme = useTheme();

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
      opacity: item.isRead ? 0.7 : 1,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.border,
    },
    body: {
      flex: 1,
      gap: 4,
    },
    text: {
      fontSize: Math.round(14 * theme.fontScale),
      color: theme.colors.textMain,
      lineHeight: Math.round(20 * theme.fontScale),
    },
    time: {
      fontSize: Math.round(12 * theme.fontScale),
      color: theme.colors.textSecondary,
    },
    cover: {
      width: 56,
      height: 56,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.border,
    },
    avatarWrap: {
      position: 'relative',
    },
    dot: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.danger,
      borderWidth: 1.5,
      borderColor: theme.colors.cardBg,
    },
  });

  return (
    <Pressable style={styles.wrap} onPress={onPress}>
      <View style={styles.avatarWrap}>
        <Pressable onPress={onAvatarPress}>
          <Image
            source={
              item.senderAvatar
                ? { uri: item.senderAvatar }
                : { uri: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=default%20user%20avatar&size=128x128' }
            }
            style={styles.avatar}
          />
        </Pressable>
        {!item.isRead && <View style={styles.dot} />}
      </View>
      <View style={styles.body}>
        <Text style={styles.text}>{getNotificationText(item)}</Text>
        <Text style={styles.time} numberOfLines={1}>
          {item.postTitle || '帖子详情'}
        </Text>
      </View>
      {item.postCoverUrl ? (
        <Image source={{ uri: item.postCoverUrl }} style={styles.cover} />
      ) : (
        <View style={styles.cover} />
      )}
    </Pressable>
  );
}
