import React, {useState} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {Avatar} from '@rneui/themed';
import {PostItem} from '../../types';
import {agriTheme} from '../../theme/agriTheme';

type Props = {
  post: PostItem;
  onLikeToggle?: (postId: number, liked: boolean) => void;
};

export default function PostCard({post, onLikeToggle}: Props) {
  const [liked, setLiked] = useState(!!post.liked);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  const handleLike = async () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : Math.max(prev - 1, 0)));
    onLikeToggle?.(post.id, nextLiked);
  };

  const avatarSource = post.author?.avatar
    ? {uri: post.author.avatar}
    : {uri: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=default%20user%20avatar&size=128x128'};

  return (
    <View style={styles.card}>
      {post.coverImageUrl && (
        <Image source={{uri: post.coverImageUrl}} style={styles.cover} />
      )}

      <View style={styles.body}>
        {post.title && (
          <Text style={styles.title} numberOfLines={1}>
            {post.title}
          </Text>
        )}
        {post.contentText ? (
          <Text style={styles.text} numberOfLines={2}>
            {post.contentText}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.author}>
            <Avatar size={20} rounded source={avatarSource} />
            <Text style={styles.authorName} numberOfLines={1}>
              {post.author?.userName || '未知用户'}
            </Text>
          </View>

          <Pressable onPress={handleLike} style={styles.likeWrap}>
            <Text style={[styles.likeIcon, liked && styles.likeIconActive]}>
              {liked ? '❤️' : '🤍'}
            </Text>
            <Text style={[styles.likeCount, liked && styles.likeCountActive]}>
              {likeCount}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: agriTheme.colors.cardBg,
    borderRadius: agriTheme.radius.lg,
    marginBottom: agriTheme.spacing.md,
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    height: 160,
    backgroundColor: agriTheme.colors.border,
  },
  body: {
    padding: agriTheme.spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: agriTheme.colors.textMain,
    marginBottom: agriTheme.spacing.xs,
  },
  text: {
    fontSize: 14,
    color: agriTheme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: agriTheme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: agriTheme.spacing.xs,
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: agriTheme.spacing.xs,
    flex: 1,
  },
  authorName: {
    fontSize: 13,
    color: agriTheme.colors.textSecondary,
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
    color: agriTheme.colors.danger,
  },
  likeCount: {
    fontSize: 13,
    color: agriTheme.colors.textSecondary,
  },
  likeCountActive: {
    color: agriTheme.colors.danger,
    fontWeight: '600',
  },
});
