import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTheme } from '../../theme/useTheme';
import { useSocket } from '../../hooks/useSocket';
import {
  getMessagesApi,
  readMessagesApi,
  sendMessageApi,
  getUnreadCountApi,
  MessageItem,
} from '../../api/message';
import { getUserByIdApi } from '../../api/user';
import { uploadImageApi } from '../../api/post';
import {
  getLocalMessages,
  saveLocalMessages,
  setUnreadMessageCount,
} from '../../store/messageStore';
import { getUserInfo } from '../../store/authStore';
import { eventBus } from '../../utils/eventBus';
import ChatMessage from '../../components/message/ChatMessage';
import { ArrowLeftIcon } from '../../components/icons';

const TIME_GAP = 3 * 60 * 1000; // 3 minutes

function shouldShowTime(current: MessageItem, prev: MessageItem | null): boolean {
  if (!prev) return true;
  const curr = new Date(current.createdAt);
  const previous = new Date(prev.createdAt);
  if (curr.toDateString() !== previous.toDateString()) return true;
  return curr.getTime() - previous.getTime() > TIME_GAP;
}

export default function ChatScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const conversationId = Number(route.params?.conversationId) || 0;
  const otherUserId = Number(route.params?.otherUserId) || 0;

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [messagePage, setMessagePage] = useState(1);
  const [messageTotalPages, setMessageTotalPages] = useState(1);
  const [otherUser, setOtherUser] = useState<{ userName: string; avatar: string } | null>(null);
  const [paddingBottom, setPaddingBottom] = useState(theme.spacing.lg * 2);
  const flatListRef = useRef<FlatList>(null);
  const conversationIdRef = useRef(conversationId);
  const otherUserIdRef = useRef(otherUserId);
  const isLoadingMoreRef = useRef(false);
  const isLoadingOlderRef = useRef(false);
  const loadOlderMessagesRef = useRef<() => Promise<void>>(async () => {});
  const layoutHeightRef = useRef(0);
  const contentHeightRef = useRef(0);
  const scrollOffsetRef = useRef(0);
  const shouldScrollToBottomRef = useRef(false);
  const pendingScrollAdjustRef = useRef<{ prevOffset: number; prevContentHeight: number } | null>(null);
  conversationIdRef.current = conversationId;
  otherUserIdRef.current = otherUserId;

  const checkAutoLoadOlder = useCallback(() => {
    if (
      contentHeightRef.current > 0 &&
      layoutHeightRef.current > 0 &&
      contentHeightRef.current <= layoutHeightRef.current &&
      messagePage < messageTotalPages
    ) {
      const fn = loadOlderMessagesRef.current;
      if (typeof fn === 'function') {
        fn();
      }
    }
  }, [messagePage, messageTotalPages]);

  const myAvatar = getUserInfo()?.avatar;

  const handleNewMessage = useCallback((msg: MessageItem) => {
    const currentConvId = conversationIdRef.current;
    if (currentConvId) {
      if (Number(msg.conversationId) !== currentConvId) return;
    } else if (Number(msg.senderId) !== otherUserIdRef.current) {
      return;
    }
    if (msg.conversationId) {
      conversationIdRef.current = Number(msg.conversationId);
    }
    setMessages(prev => [...prev, msg]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const { connect, disconnect } = useSocket(handleNewMessage);

  const scrollToBottom = () => {
    if (isLoadingOlderRef.current) return;
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const loadMessages = useCallback(async () => {
    if (!conversationIdRef.current) return;
    const convId = conversationIdRef.current;
    try {
      setLoading(true);
      const local = await getLocalMessages(convId);
      if (local.length > 0) setMessages(local);

      const res = await getMessagesApi(convId, 1);
      if (res.code === 200 && res.data) {
        const all = res.data.list;
        shouldScrollToBottomRef.current = true;
        setMessages(all);
        await saveLocalMessages(convId, all);
        setMessagePage(1);
        setMessageTotalPages(res.data.pagination.totalPages);
      }

      await readMessagesApi(convId);
      const unreadRes = await getUnreadCountApi();
      if (unreadRes.code === 200) {
        setUnreadMessageCount(unreadRes.data || 0);
        eventBus.emit('unreadMessagesUpdated', unreadRes.data || 0);
      }
    } catch {
      // use local
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOlderMessages = useCallback(async () => {
    if (!conversationIdRef.current) return;
    if (isLoadingMoreRef.current) return;
    if (messagePage >= messageTotalPages) return;

    const convId = conversationIdRef.current;
    try {
      isLoadingMoreRef.current = true;
      isLoadingOlderRef.current = true;
      setLoadingMore(true);
      const nextPage = messagePage + 1;
      const res = await getMessagesApi(convId, nextPage);
      if (res.code === 200 && res.data) {
        const older = res.data.list;
        pendingScrollAdjustRef.current = {
          prevOffset: scrollOffsetRef.current,
          prevContentHeight: contentHeightRef.current,
        };
        setMessages(prev => [...older, ...prev]);
        setMessagePage(nextPage);
        setMessageTotalPages(res.data.pagination.totalPages);
      }
    } catch {
      // ignore
    } finally {
      setLoadingMore(false);
      isLoadingMoreRef.current = false;
      setTimeout(() => {
        isLoadingOlderRef.current = false;
      }, 300);
    }
  }, [messagePage, messageTotalPages]);
  loadOlderMessagesRef.current = loadOlderMessages;

  useEffect(() => {
    connect();
    loadMessages();
    return () => disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 获取对方用户信息
  useEffect(() => {
    if (!otherUserId) return;
    getUserByIdApi(otherUserId)
      .then(res => {
        if (res.code === 200 && res.data) {
          setOtherUser({
            userName: res.data.userName,
            avatar: res.data.avatar,
          });
        }
      })
      .catch(() => {});
  }, [otherUserId]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput('');

    const tempId = Date.now();
    const tempMsg: MessageItem = {
      id: tempId,
      conversationId: conversationIdRef.current ?? 0,
      senderId: getUserInfo()?.id ?? 0,
      receiverId: otherUserId,
      type: 'text',
      content,
      imageUrl: null,
      isRead: 0,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);
    scrollToBottom();

    try {
      setSending(true);
      const res = await sendMessageApi({ receiverId: otherUserId, content, type: 'text' });
      if (res.code === 200 && res.data) {
        const serverMsg = res.data;
        if (serverMsg.conversationId) {
          conversationIdRef.current = serverMsg.conversationId;
        }
        setMessages(prev => {
          const next = prev.map(m => (m.id === tempId ? serverMsg : m));
          saveLocalMessages(serverMsg.conversationId, next).catch(() => {});
          return next;
        });
      }
    } catch {
      // keep local message
    } finally {
      setSending(false);
    }
  };

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 }, async response => {
      if (response.assets?.[0]?.uri) {
        const uri = response.assets[0].uri;
        try {
          setSending(true);
          const uploadRes = await uploadImageApi({
            uri,
            name: 'image.jpg',
            type: 'image/jpeg',
          });
          if (uploadRes.code === 200 && uploadRes.data?.url) {
            const imageUrl = uploadRes.data.url;
            const tempId = Date.now();
            const tempMsg: MessageItem = {
              id: tempId,
              conversationId: conversationIdRef.current ?? 0,
              senderId: getUserInfo()?.id ?? 0,
              receiverId: otherUserId,
              type: 'image',
              content: '[图片]',
              imageUrl,
              isRead: 0,
              createdAt: new Date().toISOString(),
            };
            setMessages(prev => [...prev, tempMsg]);
            scrollToBottom();
            const res = await sendMessageApi({
              receiverId: otherUserId,
              content: '[图片]',
              type: 'image',
              imageUrl,
            });
            if (res.code === 200 && res.data) {
              const serverMsg = res.data;
              if (serverMsg.conversationId) {
                conversationIdRef.current = serverMsg.conversationId;
              }
              setMessages(prev => {
                const next = prev.map(m => (m.id === tempId ? serverMsg : m));
                saveLocalMessages(serverMsg.conversationId, next).catch(() => {});
                return next;
              });
            }
          }
        } catch {
          // error
        } finally {
          setSending(false);
        }
      }
    });
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
    list: {
      flex: 1,
      paddingVertical: theme.spacing.md,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.cardBg,
      gap: theme.spacing.sm,
    },
    input: {
      flex: 1,
      backgroundColor: theme.colors.pageBg,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: Platform.OS === 'ios' ? 10 : 6,
      fontSize: Math.round(15 * theme.fontScale),
      color: theme.colors.textMain,
      maxHeight: 100,
    },
    sendBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primarySoft,
      justifyContent: 'center',
      alignItems: 'center',
    },
    disabled: { opacity: 0.5 },
  });

  const renderItem = ({ item, index }: { item: MessageItem; index: number }) => {
    const prev = index > 0 ? messages[index - 1] : null;
    const showTime = shouldShowTime(item, prev);
    return (
      <ChatMessage
        message={item}
        showTime={showTime}
        myAvatar={myAvatar}
        otherAvatar={otherUser?.avatar}
        onAvatarPress={() =>
          navigation.navigate('UserProfile', {
            userId: item.senderId,
            userName: otherUser?.userName,
          })
        }
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={24} color={theme.colors.textMain} />
        </Pressable>
        <Text style={styles.headerTitle}>{otherUser?.userName || `用户${otherUserId}`}</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          style={styles.list}
          contentContainerStyle={{ paddingBottom }}
          data={messages}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          scrollEventThrottle={16}
          onLayout={e => {
            const lh = e.nativeEvent.layout.height;
            layoutHeightRef.current = lh;
            const ch = contentHeightRef.current;
            const next = ch > 0 && ch < lh ? lh - ch + 1 : theme.spacing.lg * 2;
            if (next !== paddingBottom) setPaddingBottom(next);
          }}
          onContentSizeChange={(_w, h) => {
            const realH = h - paddingBottom;
            const prevRealH = contentHeightRef.current;
            contentHeightRef.current = realH;
            const lh = layoutHeightRef.current;
            const next = lh > 0 && realH < lh ? lh - realH + 1 : theme.spacing.lg * 2;
            if (next !== paddingBottom) setPaddingBottom(next);
            if (shouldScrollToBottomRef.current && flatListRef.current && realH > lh) {
              flatListRef.current.scrollToEnd({ animated: false });
              setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
              shouldScrollToBottomRef.current = false;
            }
            if (pendingScrollAdjustRef.current && flatListRef.current && prevRealH > 0) {
              const heightDiff = realH - prevRealH;
              if (heightDiff > 0) {
                flatListRef.current.scrollToOffset({
                  offset: pendingScrollAdjustRef.current.prevOffset + heightDiff,
                  animated: false,
                });
              }
              pendingScrollAdjustRef.current = null;
            }
          }}
          onScroll={({ nativeEvent }) => {
            scrollOffsetRef.current = nativeEvent.contentOffset.y;
            if (nativeEvent.contentOffset.y <= 10) {
              const fn = loadOlderMessagesRef.current;
              if (typeof fn === 'function') {
                fn();
              }
            }
          }}
          ListHeaderComponent={
            loadingMore ? (
              <ActivityIndicator
                style={{ marginVertical: 12 }}
                color={theme.colors.primary}
                size="small"
              />
            ) : null
          }
        />
      )}

      <View style={styles.footer}>
        <Pressable style={styles.imageBtn} onPress={handlePickImage} disabled={sending}>
          <Text style={{ fontSize: 20, color: theme.colors.primary }}>+</Text>
        </Pressable>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="输入消息..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <Pressable
          style={[styles.sendBtn, (!input.trim() || sending) && styles.disabled]}
          onPress={handleSend}
          disabled={!input.trim() || sending}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>发送</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
