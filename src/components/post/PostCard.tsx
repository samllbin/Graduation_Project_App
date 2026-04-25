import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@rneui/themed';
import { PostItem } from '../../types';
import { useTheme } from '../../theme/useTheme';

type Props = {
  post: PostItem;
  onLikeToggle?: (postId: number, liked: boolean) => void;
  onPress?: (post: PostItem) => void;
  compact?: boolean;
};

export default function PostCard({ post, onLikeToggle, onPress, compact }: Props) {
  const theme = useTheme();
  const liked = !!post.liked;
  const likeCount = post.likeCount;

  const handleLike = () => {
    onLikeToggle?.(Number(post.id), !liked);
  };

  const avatarSource = post.author?.avatar
    ? { uri: post.author.avatar }
    : {
        uri: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=default%20user%20avatar&size=128x128',
      };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.radius.lg,
      marginBottom: theme.spacing.md,
      overflow: 'hidden',
      ...(compact ? { flex: 1, marginHorizontal: theme.spacing.xs } : {}),
    },
    cover: {
      width: '100%',
      height: compact ? 110 : 160,
      backgroundColor: theme.colors.border,
    },
    coverPlaceholder: {
      width: '100%',
      height: compact ? 110 : 160,
      backgroundColor: theme.colors.primarySoft,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
    },
    placeholderText: {
      fontSize: Math.round(13 * theme.fontScale),
      color: theme.colors.primary,
      lineHeight: Math.round(18 * theme.fontScale),
    },
    body: {
      padding: compact ? theme.spacing.sm : theme.spacing.md,
    },
    title: {
      fontSize: Math.round(compact ? 14 : 16 * theme.fontScale),
      fontWeight: '700',
      color: theme.colors.textMain,
      marginBottom: compact ? 4 : theme.spacing.xs,
    },
    text: {
      fontSize: Math.round(14 * theme.fontScale),
      color: theme.colors.textSecondary,
      lineHeight: Math.round(20 * theme.fontScale),
      marginBottom: theme.spacing.sm,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: compact ? 4 : theme.spacing.xs,
    },
    author: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      flex: 1,
    },
    authorName: {
      fontSize: Math.round(compact ? 11 : 13 * theme.fontScale),
      color: theme.colors.textSecondary,
    },
    likeWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    likeIcon: {
      fontSize: 16,
    },
    likeIconActive: {
      color: theme.colors.danger,
    },
    likeCount: {
      fontSize: Math.round(13 * theme.fontScale),
      color: theme.colors.textSecondary,
    },
    likeCountActive: {
      color: theme.colors.danger,
      fontWeight: '600',
    },
  });

  return (
    <Pressable style={styles.card} onPress={() => onPress?.(post)}>
      {post.coverImageUrl ? (
        <Image source={{ uri: post.coverImageUrl }} style={styles.cover} />
      ) : (
        <View style={styles.coverPlaceholder}>
          <Text style={styles.placeholderText} numberOfLines={compact ? 3 : 4}>
            {post.contentText}
          </Text>
        </View>
      )}

      <View style={styles.body}>
        {post.title && (
          <Text style={styles.title} numberOfLines={compact ? 1 : 1}>
            {post.title}
          </Text>
        )}
        {!compact && post.contentText ? (
          <Text style={styles.text} numberOfLines={2}>
            {post.contentText}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.author}>
            <Avatar size={compact ? 16 : 20} rounded source={avatarSource} />
            <Text style={styles.authorName} numberOfLines={1}>
              {post.author?.userName || '未知用户'}
            </Text>
          </View>

          {!compact && (
            <Pressable onPress={handleLike} style={styles.likeWrap}>
              <Text style={[styles.likeIcon, liked && styles.likeIconActive]}>
                {liked ? '❤️' : '🤍'}
              </Text>
              <Text style={[styles.likeCount, liked && styles.likeCountActive]}>{likeCount}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}
