import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Avatar } from '@rneui/themed';
import PostImageGrid from '../../components/post/PostImageGrid';
import ImageViewer from '../../components/post/ImageViewer';
import {
  CommentItem,
  createCommentApi,
  deleteCommentApi,
  deletePostApi,
  getCommentListApi,
  getPostDetailApi,
  likePostApi,
  unlikePostApi,
} from '../../api/post';
import { PostItem } from '../../types';
import { getUserInfo } from '../../store/authStore';
import { formatRelativeTime } from '../../utils/time';
import { useTheme } from '../../theme/useTheme';
import { CloseIcon, EyeIcon, HeartIcon, HeartOutlineIcon, TrashIcon } from '../../components/icons';

type ReplyTarget = {
  commentId: number;
  replyToUserId: number;
  replyToUserName: string;
};

export default function PostDetailScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const postId = route.params?.postId as number;

  const [post, setPost] = useState<PostItem | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentPage, setCommentPage] = useState(1);
  const [commentTotalPages, setCommentTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [liking, setLiking] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const currentUserId = getUserInfo()?.id ?? null;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.pageBg },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.pageBg,
    },
    empty: { color: theme.colors.textSecondary, fontSize: Math.round(15 * theme.fontScale) },
    postWrap: {
      backgroundColor: theme.colors.cardBg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    deletePostBtn: {
      alignSelf: 'flex-end',
      marginBottom: theme.spacing.sm,
    },
    deletePostText: {
      color: theme.colors.danger,
      fontSize: Math.round(13 * theme.fontScale),
    },
    contentText: {
      fontSize: Math.round(15 * theme.fontScale),
      color: theme.colors.textMain,
      lineHeight: Math.round(22 * theme.fontScale),
      marginBottom: theme.spacing.md,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    authorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      flex: 1,
    },
    authorName: {
      fontSize: Math.round(13 * theme.fontScale),
      color: theme.colors.textSecondary,
    },
    metaTime: {
      fontSize: Math.round(12 * theme.fontScale),
      color: theme.colors.textSecondary,
    },
    metaRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    likeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    likeIcon: { fontSize: 16 },
    likeIconActive: { color: theme.colors.danger },
    likeCount: { fontSize: Math.round(13 * theme.fontScale), color: theme.colors.textSecondary },
    likeCountActive: { color: theme.colors.danger, fontWeight: '600' },
    viewBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    viewIcon: { fontSize: 14 },
    viewCount: { fontSize: Math.round(13 * theme.fontScale), color: theme.colors.textSecondary },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.md,
    },
    commentHeader: {
      fontSize: Math.round(15 * theme.fontScale),
      fontWeight: '700',
      color: theme.colors.textMain,
    },
    commentItem: {
      backgroundColor: theme.colors.cardBg,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    commentRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    commentMain: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      flex: 1,
    },
    deleteIconWrap: {
      paddingLeft: theme.spacing.sm,
      paddingTop: 2,
    },
    deleteIcon: {
      fontSize: 14,
      color: theme.colors.danger,
    },
    commentBody: {
      flex: 1,
      gap: 4,
    },
    commentAuthor: {
      fontSize: Math.round(14 * theme.fontScale),
      fontWeight: '600',
      color: theme.colors.textMain,
    },
    commentText: {
      fontSize: Math.round(14 * theme.fontScale),
      color: theme.colors.textMain,
      lineHeight: Math.round(20 * theme.fontScale),
    },
    commentTime: {
      fontSize: Math.round(12 * theme.fontScale),
      color: theme.colors.textSecondary,
    },
    repliesWrap: {
      marginLeft: 44,
      marginTop: theme.spacing.sm,
      backgroundColor: theme.colors.pageBg,
      borderRadius: theme.radius.md,
      padding: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    replyRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    replyMain: {
      flex: 1,
      gap: 2,
    },
    replyText: {
      fontSize: Math.round(13 * theme.fontScale),
      lineHeight: Math.round(18 * theme.fontScale),
    },
    replyAuthor: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    replyTo: {
      color: theme.colors.textSecondary,
    },
    replyContent: {
      color: theme.colors.textMain,
    },
    replyTime: {
      fontSize: Math.round(11 * theme.fontScale),
      color: theme.colors.textSecondary,
    },
    noComment: {
      textAlign: 'center',
      color: theme.colors.textSecondary,
      paddingVertical: theme.spacing.lg,
      fontSize: Math.round(14 * theme.fontScale),
    },
    footer: { marginVertical: theme.spacing.md },
    inputWrap: {
      backgroundColor: theme.colors.cardBg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      paddingBottom: Platform.OS === 'ios' ? theme.spacing.lg : theme.spacing.sm,
    },
    replyHint: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    replyHintText: {
      fontSize: Math.round(12 * theme.fontScale),
      color: theme.colors.primary,
    },
    replyHintClose: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      paddingHorizontal: 4,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    input: {
      flex: 1,
      backgroundColor: theme.colors.pageBg,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 8,
      fontSize: Math.round(14 * theme.fontScale),
      color: theme.colors.textMain,
      maxHeight: 80,
      minHeight: 40,
    },
    sendBtn: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: theme.radius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendBtnDisabled: {
      backgroundColor: theme.colors.border,
    },
    sendBtnText: {
      color: '#fff',
      fontSize: Math.round(14 * theme.fontScale),
      fontWeight: '600',
    },
  });

  const numericPostId = Number(postId);

  const fetchPost = async () => {
    try {
      const res = await getPostDetailApi(numericPostId);
      if (res.code === 200 && res.data) {
        setPost(res.data);
      } else {
        setPost(null);
      }
    } catch {
      setPost(null);
    }
  };

  const fetchComments = async (targetPage: number, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (targetPage === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await getCommentListApi(numericPostId, targetPage, 10);
      if (res.code === 200 && res.data) {
        const newList = res.data.list || [];
        setComments(prev => (targetPage === 1 ? newList : [...prev, ...newList]));
        setCommentPage(targetPage);
        setCommentTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchPost(), fetchComments(1, false)]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [postId]);

  const onRefresh = () => {
    fetchPost();
    fetchComments(1, true);
  };

  const onLoadMoreComments = () => {
    if (loadingMore || commentPage >= commentTotalPages) return;
    fetchComments(commentPage + 1);
  };

  const handleLikeToggle = async () => {
    if (!post || liking) return;
    const nextLiked = !post.liked;
    setLiking(true);
    try {
      if (nextLiked) {
        await likePostApi(Number(post.id));
      } else {
        await unlikePostApi(Number(post.id));
      }
      setPost({
        ...post,
        liked: nextLiked,
        likeCount: nextLiked ? post.likeCount + 1 : Math.max(post.likeCount - 1, 0),
      });
    } catch {}
    finally {
      setLiking(false);
    }
  };

  const handleDeletePost = () => {
    if (!post) return;
    Alert.alert('删除帖子', '确定要删除这条帖子吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePostApi(Number(post.id));
            navigation.goBack();
          } catch {}
        },
      },
    ]);
  };

  const handleSubmitComment = async () => {
    const text = commentText.trim();
    if (!text) return;
    if (!post) return;

    try {
      setSubmitting(true);
      const body: any = { postId: Number(post.id), contentText: text };
      if (replyTarget) {
        body.parentId = replyTarget.commentId;
        body.replyToUserId = replyTarget.replyToUserId;
      }
      const res = await createCommentApi(body);
      if (res.code === 200) {
        setCommentText('');
        setReplyTarget(null);
        fetchComments(1, false);
        setPost(prev => (prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev));
      }
    } catch {}
    finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = (comment: CommentItem) => {
    Alert.alert('删除评论', '确定要删除这条评论吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCommentApi(Number(comment.id));
            if (comment.level === 1) {
              const childCount = comment.replies?.length || 0;
              setPost(prev => (prev ? { ...prev, commentCount: Math.max(prev.commentCount - 1 - childCount, 0) } : prev));
            } else {
              setPost(prev => (prev ? { ...prev, commentCount: Math.max(prev.commentCount - 1, 0) } : prev));
            }
            fetchComments(1, false);
          } catch {}
        },
      },
    ]);
  };

  const handleReply = (comment: CommentItem) => {
    const targetId = comment.level === 1 ? comment.id : (comment.rootId || comment.parentId || comment.id);
    const targetUserId = comment.userId;
    const targetUserName = comment.author?.userName || '用户';
    setReplyTarget({ commentId: targetId, replyToUserId: targetUserId, replyToUserName: targetUserName });
    inputRef.current?.focus();
  };

  const canDeleteComment = (comment: CommentItem) =>
    Number(comment.userId) === currentUserId || Number(post?.userId) === currentUserId;

  const handleLongPressComment = (comment: CommentItem) => {
    if (canDeleteComment(comment)) {
      handleDeleteComment(comment);
    }
  };

  const renderComment = ({ item }: { item: CommentItem }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentRow}>
        <Pressable
          onLongPress={() => handleLongPressComment(item)}
          onPress={() => handleReply(item)}
          style={styles.commentMain}
        >
          <Pressable
            onPress={() => {
              if (item.author?.id && item.author.id !== getUserInfo()?.id) {
                navigation.navigate('UserProfile', { userId: item.author.id, userName: item.author?.userName });
              }
            }}
          >
            <Avatar size={32} rounded source={{ uri: item.author?.avatar || 'https://neeko-copilot.bytedance.net/api/text2image?prompt=default%20user%20avatar&size=128x128' }} />
          </Pressable>
          <View style={styles.commentBody}>
            <Text style={styles.commentAuthor}>{item.author?.userName || '未知用户'}</Text>
            <Text style={styles.commentText}>{item.contentText}</Text>
            <Text style={styles.commentTime}>{formatRelativeTime(item.createdAt)}</Text>
          </View>
        </Pressable>
        {canDeleteComment(item) && (
          <Pressable onPress={() => handleDeleteComment(item)} style={styles.deleteIconWrap}>
            <TrashIcon size={14} color={theme.colors.danger} />
          </Pressable>
        )}
      </View>

      {item.replies?.length > 0 && (
        <View style={styles.repliesWrap}>
          {item.replies.map(reply => (
            <View key={reply.id} style={styles.replyRow}>
              <Pressable
                onLongPress={() => handleLongPressComment(reply)}
                onPress={() => handleReply(reply)}
                style={styles.replyMain}
              >
                <Text style={styles.replyText}>
                  <Text style={styles.replyAuthor}>{reply.author?.userName}</Text>
                  {reply.replyToUser ? (
                    <>
                      <Text style={styles.replyTo}> 回复 </Text>
                      <Text style={styles.replyAuthor}>{reply.replyToUser.userName}</Text>
                    </>
                  ) : null}
                  <Text style={styles.replyContent}>：{reply.contentText}</Text>
                </Text>
                <Text style={styles.replyTime}>{formatRelativeTime(reply.createdAt)}</Text>
              </Pressable>
              {canDeleteComment(reply) && (
                <Pressable onPress={() => handleDeleteComment(reply)} style={styles.deleteIconWrap}>
                  <TrashIcon size={14} color={theme.colors.danger} />
                </Pressable>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (loading && !post) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>帖子已被删除</Text>
      </View>
    );
  }

  const avatarSource = post.author?.avatar
    ? { uri: post.author.avatar }
    : { uri: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=default%20user%20avatar&size=128x128' };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        data={comments}
        keyExtractor={item => String(item.id)}
        renderItem={renderComment}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={onLoadMoreComments}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <View style={styles.postWrap}>
            {Number(post.userId) === currentUserId && (
              <Pressable style={styles.deletePostBtn} onPress={handleDeletePost}>
                <Text style={styles.deletePostText}>删除</Text>
              </Pressable>
            )}

            <PostImageGrid
              images={post.images || []}
              onPressImage={index => {
                setViewerIndex(index);
                setViewerVisible(true);
              }}
            />

            <Text style={styles.contentText}>{post.contentText}</Text>

            <View style={styles.metaRow}>
              <Pressable
                style={styles.authorRow}
                onPress={() =>
                  navigation.navigate('UserProfile', {
                    userId: post.userId,
                    userName: post.author?.userName,
                  })
                }
              >
                <Avatar size={24} rounded source={avatarSource} />
                <Text style={styles.authorName}>{post.author?.userName || '未知用户'}</Text>
                <Text style={styles.metaTime}>{formatRelativeTime(post.createdAt)}</Text>
              </Pressable>

              <View style={styles.metaRight}>
                <Pressable onPress={handleLikeToggle} style={[styles.likeBtn, liking && { opacity: 0.5 }]} disabled={liking}>
                  {post.liked ? (
                    <HeartIcon size={16} color={theme.colors.danger} />
                  ) : (
                    <HeartOutlineIcon size={16} color={theme.colors.textSecondary} />
                  )}
                  <Text style={[styles.likeCount, post.liked && styles.likeCountActive]}>
                    {post.likeCount}
                  </Text>
                </Pressable>
                <View style={styles.viewBtn}>
                  <EyeIcon size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.viewCount}>{post.viewCount}</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />
            <Text style={styles.commentHeader}>评论 {post.commentCount}</Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={styles.footer} color={theme.colors.primary} />
          ) : comments.length === 0 && !loading ? (
            <Text style={styles.noComment}>还没有评论，快来抢沙发吧~</Text>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <View style={styles.inputWrap}>
        {replyTarget && (
          <View style={styles.replyHint}>
            <Text style={styles.replyHintText}>回复 {replyTarget.replyToUserName}</Text>
            <Pressable onPress={() => setReplyTarget(null)}>
              <CloseIcon size={14} color={theme.colors.textSecondary} />
            </Pressable>
          </View>
        )}
        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={replyTarget ? `回复 ${replyTarget.replyToUserName}...` : '写评论...'}
            placeholderTextColor={theme.colors.textSecondary}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />
          <Pressable
            style={[styles.sendBtn, !commentText.trim() && styles.sendBtnDisabled]}
            onPress={handleSubmitComment}
            disabled={!commentText.trim() || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendBtnText}>发送</Text>
            )}
          </Pressable>
        </View>
      </View>

      <ImageViewer
        visible={viewerVisible}
        images={post.images || []}
        initialIndex={viewerIndex}
        onClose={() => setViewerVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}
