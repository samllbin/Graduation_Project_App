import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import PostCard from '../../components/post/PostCard';
import {getLikedPostsApi, unlikePostApi} from '../../api/post';
import {PostItem} from '../../types';
import {agriTheme} from '../../theme/agriTheme';

export default function LikedPostsScreen() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({tabBarStyle: {display: 'none'}});
      return () => parent?.setOptions({tabBarStyle: undefined});
    }, [navigation]),
  );

  const fetch = async (targetPage: number, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (targetPage === 1) setLoading(true);
      else setLoadingMore(true);
      setError('');

      const res = await getLikedPostsApi(targetPage, 10);
      if (res.code === 200 && res.data) {
        const newPosts = res.data.list || [];
        setPosts((prev) => (targetPage === 1 ? newPosts : [...prev, ...newPosts]));
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
        await unlikePostApi(postId);
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      } catch {}
    }
  };

  const renderItem = ({item}: {item: PostItem}) => (
    <PostCard post={item} onLikeToggle={handleLikeToggle} />
  );

  if (loading && posts.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={agriTheme.colors.primary} />
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
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={styles.footer} color={agriTheme.colors.primary} />
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

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: agriTheme.colors.pageBg},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: agriTheme.spacing.lg},
  list: {padding: agriTheme.spacing.lg, paddingBottom: agriTheme.spacing.xl},
  error: {color: agriTheme.colors.danger, marginBottom: agriTheme.spacing.md},
  retry: {backgroundColor: agriTheme.colors.primarySoft, paddingHorizontal: agriTheme.spacing.lg, paddingVertical: agriTheme.spacing.sm, borderRadius: agriTheme.radius.md},
  retryText: {color: agriTheme.colors.primary, fontWeight: '600'},
  footer: {marginVertical: agriTheme.spacing.md},
  empty: {color: agriTheme.colors.textSecondary, fontSize: 15},
});
