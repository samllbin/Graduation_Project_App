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
import { getLocalMessages, saveLocalMessages, setUnreadMessageCount } from '../../store/messageStore';
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
  const flatListRef = useRef<FlatList>(null);
  const conversationIdRef = useRef(conversationId);
  const otherUserIdRef = useRef(otherUserId);
  const isLoadingMoreRef = useRef(false);
  const isLoadingOlderRef = useRef(false);
  conversationIdRef.current = conversationId;
  otherUserIdRef.current = otherUserId;

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
    setMessages((prev) => [...prev, msg]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const { connect, disconnect, sendMessage: sendSocketMessage } = useSocket(handleNewMessage);

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

      scrollToBottom();
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
        setMessages((prev) => [...older, ...prev]);
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
      .then((res) => {
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
    setMessages((prev) => [...prev, tempMsg]);
    scrollToBottom();

    try {
      setSending(true);
      sendSocketMessage({ receiverId: otherUserId, content, type: 'text' });
      const res = await sendMessageApi({ receiverId: otherUserId, content, type: 'text' });
      if (res.code === 200 && res.data) {
        const serverMsg = res.data;
        if (serverMsg.conversationId) {
          conversationIdRef.current = serverMsg.conversationId;
        }
        setMessages((prev) => {
          const next = prev.map((m) => (m.id === tempId ? serverMsg : m));
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
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 }, async (response) => {
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
            setMessages((prev) => [...prev, tempMsg]);
            scrollToBottom();
            sendSocketMessage({ receiverId: otherUserId, content: '[图片]', type: 'image', imageUrl });
            const res = await sendMessageApi({ receiverId: otherUserId, content: '[图片]', type: 'image', imageUrl });
            if (res.code === 200 && res.data) {
              const serverMsg = res.data;
              if (serverMsg.conversationId) {
                conversationIdRef.current = serverMsg.conversationId;
              }
              setMessages((prev) => {
                const next = prev.map((m) => (m.id === tempId ? serverMsg : m));
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

      {loading && messages.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.primary} />
      ) : (
        <FlatList
          ref={flatListRef}
          style={styles.list}
          contentContainerStyle={{ paddingBottom: theme.spacing.lg * 2 }}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          onStartReached={loadOlderMessages}
          onStartReachedThreshold={0.3}
          ListHeaderComponent={
            loadingMore ? (
              <ActivityIndicator style={{ marginVertical: 12 }} color={theme.colors.primary} size="small" />
            ) : null
          }
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
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
