import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import PostCard from '../../components/post/PostCard';
import { getLikedPostsApi, unlikePostApi } from '../../api/post';
import { PostItem } from '../../types';
import { useTheme } from '../../theme/useTheme';

export default function LikedPostsScreen() {
  const theme = useTheme();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation<any>();

  const fetch = async (targetPage: number, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (targetPage === 1) setLoading(true);
      else setLoadingMore(true);
      setError('');

      const res = await getLikedPostsApi(targetPage, 10);
      if (res.code === 200 && res.data) {
        const newPosts = res.data.list || [];
        setPosts(prev => (targetPage === 1 ? newPosts : [...prev, ...newPosts]));
        setPage(targetPage);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } else {
        setError(res.message || '获取失败');
      }
    } catch (e: any) {
      setError(e?.message || '获取失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetch(1, true);
    }, []),
  );

  const onRefresh = () => fetch(1, true);
  const onLoadMore = () => {
    if (loadingMore || page >= totalPages) return;
    fetch(page + 1);
  };

  const handleLikeToggle = async (postId: number, liked: boolean) => {
    if (!liked) {
      try {
        await unlikePostApi(Number(postId));
        setPosts(prev => prev.filter(p => Number(p.id) !== Number(postId)));
      } catch {}
    }
  };

  const handlePostPress = (post: PostItem) => {
    navigation.navigate('PostDetail', { postId: post.id });
  };

  const renderItem = ({ item }: { item: PostItem }) => (
    <PostCard post={item} onLikeToggle={handleLikeToggle} onPress={handlePostPress} />
  );

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.pageBg },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },
    list: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xl },
    error: { color: theme.colors.danger, marginBottom: theme.spacing.md },
    retry: {
      backgroundColor: theme.colors.primarySoft,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.md,
    },
    retryText: { color: theme.colors.primary, fontWeight: '600' },
    footer: { marginVertical: theme.spacing.md },
    empty: { color: theme.colors.textSecondary, fontSize: 15 },
  });

  if (loading && posts.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!!error && posts.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Pressable style={styles.retry} onPress={onRefresh}>
            <Text style={styles.retryText}>重试</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={posts}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={styles.footer} color={theme.colors.primary} />
          ) : null
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View style={styles.center}>
              <Text style={styles.empty}>还没有点赞过任何帖子</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
