import React, { useCallback, useEffect, useState } from 'react';
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
import { getPostListApi, likePostApi, unlikePostApi } from '../../api/post';
import { PostItem } from '../../types';
import { useTheme } from '../../theme/useTheme';

export default function ForumScreen() {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const fetch = useCallback(async (targetPage: number, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (targetPage === 1) setLoading(true);
      else setLoadingMore(true);
      setError('');

      const res = await getPostListApi('time', targetPage, 10);
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
  }, []);

  useEffect(() => {
    fetch(1, false);
  }, [fetch]);

  useFocusEffect(
    useCallback(() => {
      fetch(1, true);
    }, [fetch]),
  );

  const onRefresh = () => fetch(1, true);
  const onLoadMore = () => {
    if (loadingMore || page >= totalPages) return;
    fetch(page + 1);
  };

  const handleLikeToggle = async (postId: number, liked: boolean) => {
    const id = Number(postId);
    try {
      if (liked) {
        await likePostApi(id);
      } else {
        await unlikePostApi(id);
      }
      setPosts(prev =>
        prev.map(p => (Number(p.id) === id ? { ...p, liked, likeCount: liked ? p.likeCount + 1 : Math.max(p.likeCount - 1, 0) } : p)),
      );
    } catch {}
  };

  const handlePostPress = (post: PostItem) => {
    navigation.navigate('PostDetail', { postId: post.id });
  };

  const renderItem = ({ item }: { item: PostItem }) => (
    <PostCard post={item} onLikeToggle={handleLikeToggle} onPress={handlePostPress} />
  );

  if (loading && posts.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.pageBg }]} >
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.pageBg }}>
      {!!error && posts.length === 0 && (
        <View style={[styles.center, { backgroundColor: theme.colors.pageBg, padding: theme.spacing.lg }]} >
          <Text style={[styles.error, { color: theme.colors.danger, marginBottom: theme.spacing.md }]} >{error}</Text>
          <Pressable
            style={[styles.retry, {
              backgroundColor: theme.colors.primarySoft,
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.sm,
              borderRadius: theme.radius.md,
            }]}
            onPress={onRefresh}
          >
            <Text style={[styles.retryText, { color: theme.colors.primary }]} >重试</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={posts}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={{ marginVertical: theme.spacing.md }} color={theme.colors.primary} />
          ) : null
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View style={[styles.center, { backgroundColor: theme.colors.pageBg, padding: theme.spacing.lg }]} >
              <Text style={[styles.empty, { color: theme.colors.textSecondary }]} >还没有帖子</Text>
            </View>
          ) : null
        }
      />

      <Pressable
        style={{
          position: 'absolute',
          right: theme.spacing.lg,
          bottom: theme.spacing.lg + 60,
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: theme.colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        }}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { fontSize: 14 },
  retry: {},
  retryText: { fontWeight: '600' },
  empty: { fontSize: 15 },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
});
