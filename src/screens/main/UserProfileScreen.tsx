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
import { useNavigation, useRoute } from '@react-navigation/native';
import { Avatar } from '@rneui/themed';
import { useTheme } from '../../theme/useTheme';
import { getUserProfileApi } from '../../api/user';
import { getPostListApi } from '../../api/post';
import { getConversationApi } from '../../api/message';
import { getUserInfo } from '../../store/authStore';
import { PostItem } from '../../types';
import PostCard from '../../components/post/PostCard';
import { ArrowLeftIcon } from '../../components/icons';

export default function UserProfileScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const userId = Number(route.params?.userId) || 0;
  const userName = route.params?.userName as string;

  const [user, setUser] = useState<{ userName: string; avatar: string; signature: string } | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      if (userName) {
        const res = await getUserProfileApi(userName);
        if (res.data) {
          setUser({
            userName: res.data.userName,
            avatar: res.data.avatar,
            signature: res.data.signature,
          });
        }
      }
    } catch {}
  }, [userName]);

  const fetchPosts = useCallback(async (targetPage: number, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (targetPage === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await getPostListApi('time', targetPage, 10, undefined, undefined, undefined, userId);
      if (res.code === 200 && res.data) {
        const newPosts = res.data.list || [];
        setPosts((prev) => (targetPage === 1 ? newPosts : [...prev, ...newPosts]));
        setPage(targetPage);
        setTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUser();
    fetchPosts(1, false);
  }, [loadUser, fetchPosts]);

  const onRefresh = () => fetchPosts(1, true);
  const onLoadMore = () => {
    if (loadingMore || page >= totalPages) return;
    fetchPosts(page + 1);
  };

  const handleChatPress = async () => {
    try {
      const res = await getConversationApi(userId);
      if (res.code === 200 && res.data) {
        navigation.navigate('Chat', { conversationId: res.data.id, otherUserId: userId });
        return;
      }
    } catch {}
    navigation.navigate('Chat', { otherUserId: userId });
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.pageBg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.cardBg,
    },
    backBtn: { padding: 4 },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: Math.round(17 * theme.fontScale),
      fontWeight: '700',
      color: theme.colors.textMain,
      marginRight: 28,
    },
    profileWrap: {
      backgroundColor: theme.colors.cardBg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    info: {
      flex: 1,
      gap: 4,
    },
    name: {
      fontSize: Math.round(18 * theme.fontScale),
      fontWeight: '700',
      color: theme.colors.textMain,
    },
    signature: {
      fontSize: Math.round(13 * theme.fontScale),
      color: theme.colors.textSecondary,
    },
    chatBtn: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.md,
    },
    chatBtnText: {
      color: '#fff',
      fontSize: Math.round(14 * theme.fontScale),
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: Math.round(16 * theme.fontScale),
      fontWeight: '700',
      color: theme.colors.textMain,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    empty: {
      color: theme.colors.textSecondary,
      fontSize: Math.round(15 * theme.fontScale),
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={24} color={theme.colors.textMain} />
        </Pressable>
        <Text style={styles.headerTitle}>个人主页</Text>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <>
            <View style={styles.profileWrap}>
              <Avatar
                size={64}
                rounded
                source={
                  user?.avatar
                    ? { uri: user.avatar }
                    : { uri: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=default%20user%20avatar&size=128x128' }
                }
              />
              <View style={styles.info}>
                <Text style={styles.name}>{user?.userName || userName || '未知用户'}</Text>
                <Text style={styles.signature} numberOfLines={2}>
                  {user?.signature || '这个人很懒，没有签名'}
                </Text>
              </View>
              {userId !== (getUserInfo()?.id ?? 0) && (
                <Pressable style={styles.chatBtn} onPress={handleChatPress}>
                  <Text style={styles.chatBtnText}>私信</Text>
                </Pressable>
              )}
            </View>
            <Text style={styles.sectionTitle}>发布的帖子</Text>
          </>
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={{ marginVertical: theme.spacing.md }} color={theme.colors.primary} />
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={[styles.center, { padding: theme.spacing.lg }]}>
              <Text style={styles.empty}>还没有发布帖子</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
