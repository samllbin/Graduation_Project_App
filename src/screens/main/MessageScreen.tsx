import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/useTheme';
import { useSocket } from '../../hooks/useSocket';
import {
  getConversationsApi,
  getUnreadCountApi,
  ConversationItem as ConversationItemType,
  MessageItem,
} from '../../api/message';
import { getNotificationsApi, readNotificationsApi, NotificationItem as NotificationItemType } from '../../api/notification';
import {
  getLocalConversations,
  saveLocalConversations,
  setUnreadMessageCount,
  getUnreadMessageCount,
} from '../../store/messageStore';
import {
  getLocalNotifications,
  saveLocalNotifications,
  setUnreadNotificationCount,
  getUnreadNotificationCount,
} from '../../store/notificationStore';
import { getUserInfo } from '../../store/authStore';
import ConversationItem from '../../components/message/ConversationItem';
import NotificationItem from '../../components/message/NotificationItem';
import { eventBus } from '../../utils/eventBus';

type Props = {
  onUnreadChange?: (count: number) => void;
};

export default function MessageScreen({ onUnreadChange }: Props) {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'chat' | 'notification'>('chat');

  const [conversations, setConversations] = useState<ConversationItemType[]>([]);
  const [notifications, setNotifications] = useState<NotificationItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifRefreshing, setNotifRefreshing] = useState(false);

  const fetchConversations = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await getConversationsApi();
      if (res.code === 200 && res.data) {
        const currentUserId = getUserInfo()?.id ?? 0;
        const list = res.data.filter((c) => Number(c.userAId) !== Number(c.userBId));
        setConversations(list);
        await saveLocalConversations(list);
        const unreadRes = await getUnreadCountApi();
        const totalUnread = unreadRes.code === 200 ? (unreadRes.data || 0) : 0;
        setUnreadMessageCount(totalUnread);
        const notifUnread = getUnreadNotificationCount();
        onUnreadChange?.(totalUnread + notifUnread);
      }
    } catch {
      const currentUserId = getUserInfo()?.id ?? 0;
      const local = (await getLocalConversations()).filter(
        (c) => Number(c.userAId) !== Number(c.userBId),
      );
      setConversations(local);
      const localUnread = local.reduce((sum, c) => {
        const isA = currentUserId === Number(c.userAId);
        return sum + (isA ? c.unreadCountA : c.unreadCountB);
      }, 0);
      setUnreadMessageCount(localUnread);
      const notifUnread = getUnreadNotificationCount();
      onUnreadChange?.(localUnread + notifUnread);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onUnreadChange]);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setNotifRefreshing(true);
      else setNotifLoading(true);
      const res = await getNotificationsApi(1);
      if (res.code === 200 && res.data) {
        let list = res.data.list;
        // 强制校正：用户已点击过的通知保持已读状态
        if (recentlyReadIds.current.size > 0) {
          list = list.map((n) =>
            recentlyReadIds.current.has(Number(n.id)) ? { ...n, isRead: 1 } : n,
          );
          // 后端已同步为已读的清掉，避免无限累积
          list.forEach((n) => {
            if (n.isRead === 1) recentlyReadIds.current.delete(Number(n.id));
          });
        }
        setNotifications(list);
        await saveLocalNotifications(list);
        const unread = list.filter((n) => !n.isRead).length;
        setUnreadNotificationCount(unread);
        const msgUnread = getUnreadMessageCount();
        onUnreadChange?.(msgUnread + unread);
      }
    } catch {
      const local = await getLocalNotifications();
      setNotifications(local);
    } finally {
      setNotifLoading(false);
      setNotifRefreshing(false);
    }
  }, [onUnreadChange]);

  const isFocused = useIsFocused();

  const fetchConversationsRef = useRef(fetchConversations);
  const fetchNotificationsRef = useRef(fetchNotifications);
  const activeTabRef = useRef(activeTab);
  const recentlyReadIds = useRef<Set<number>>(new Set());
  fetchConversationsRef.current = fetchConversations;
  fetchNotificationsRef.current = fetchNotifications;
  activeTabRef.current = activeTab;

  const handleNewMessage = useCallback((msg: MessageItem) => {
    // 收到新消息直接刷新会话列表和未读数，不受当前子 tab 限制
    fetchConversationsRef.current(true);
  }, []);

  const handleNotificationsUpdated = useCallback(() => {
    // 收到通知更新推送，刷新通知列表
    fetchNotificationsRef.current(true);
  }, []);

  const { connect, disconnect } = useSocket(handleNewMessage, handleNotificationsUpdated);

  useEffect(() => {
    console.log('📱 MessageScreen mounted, calling connect...');
    connect();
    // 组件挂载就拉一次数据，不等 isFocused
    fetchConversationsRef.current(true);
    fetchNotificationsRef.current(true);
    return () => {
      console.log('📱 MessageScreen unmounting, calling disconnect...');
      disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsub = eventBus.on('unreadMessagesUpdated', (msgUnread) => {
      setUnreadMessageCount(msgUnread);
      const notifUnread = getUnreadNotificationCount();
      onUnreadChange?.(msgUnread + notifUnread);
    });
    return unsub;
  }, [onUnreadChange]);

  useEffect(() => {
    if (isFocused) {
      fetchConversationsRef.current(true);
      fetchNotificationsRef.current(true);
    }
  }, [isFocused]);

  // 通知轮询
  useEffect(() => {
    if (activeTab !== 'notification' || !isFocused) return;
    const timer = setInterval(() => {
      fetchNotificationsRef.current(true);
    }, 10000);
    return () => clearInterval(timer);
  }, [activeTab, isFocused]);

  const handleConversationPress = (item: ConversationItemType) => {
    const currentUserId = getUserInfo()?.id ?? 0;
    const userAId = Number(item.userAId);
    const userBId = Number(item.userBId);
    const otherUserId = userAId === currentUserId ? userBId : userAId;
    navigation.navigate('Chat', { conversationId: item.id, otherUserId });
  };

  const handleNotificationPress = async (item: NotificationItemType) => {
    navigation.navigate('PostDetail', { postId: item.postId });
    if (item.isRead) return;

    const nid = Number(item.id);
    recentlyReadIds.current.add(nid);

    // 乐观更新通知列表和未读计数
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === item.id ? { ...n, isRead: 1 } : n));
      const unread = next.filter((n) => !n.isRead).length;
      setUnreadNotificationCount(unread);
      const msgUnread = getUnreadMessageCount();
      onUnreadChange?.(msgUnread + unread);
      saveLocalNotifications(next).catch(() => {});
      return next;
    });

    try {
      await readNotificationsApi([nid]);
      fetchNotificationsRef.current(true);
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await readNotificationsApi();
      recentlyReadIds.current.clear();
      const next = notifications.map((n) => ({ ...n, isRead: 1 }));
      setNotifications(next);
      setUnreadNotificationCount(0);
      const msgUnread = getUnreadMessageCount();
      onUnreadChange?.(msgUnread);
      saveLocalNotifications(next).catch(() => {});
    } catch {}
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.pageBg },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: theme.colors.cardBg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
    },
    tabText: {
      fontSize: Math.round(15 * theme.fontScale),
      fontWeight: '600',
    },
    tabIndicator: {
      position: 'absolute',
      bottom: 0,
      width: 40,
      height: 3,
      borderRadius: 2,
      backgroundColor: theme.colors.primary,
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
    markAllBtn: {
      alignSelf: 'flex-end',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    markAllText: {
      fontSize: Math.round(13 * theme.fontScale),
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });

  const renderChatList = () => (
    <FlatList
      data={conversations}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchConversations(true)} />}
      renderItem={({ item }) => {
        const currentUserId = getUserInfo()?.id ?? 0;
        const userAId = Number(item.userAId);
        const userBId = Number(item.userBId);
        const otherUserId = userAId === currentUserId ? userBId : userAId;
        const otherUserName = item.otherUserName || (userAId === currentUserId ? `用户${userBId}` : `用户${userAId}`);
        return (
          <ConversationItem
            item={item}
            onPress={() => handleConversationPress(item)}
            onAvatarPress={() => navigation.navigate('UserProfile', { userId: otherUserId, userName: otherUserName })}
          />
        );
      }}
      ListEmptyComponent={
        !loading ? (
          <View style={[styles.center, { padding: theme.spacing.lg }]}>
            <Text style={styles.empty}>暂无会话</Text>
          </View>
        ) : null
      }
    />
  );

  const renderNotificationList = () => (
    <FlatList
      data={notifications}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={notifRefreshing} onRefresh={() => fetchNotifications(true)} />}
      renderItem={({ item }) => (
        <NotificationItem
          item={item}
          onPress={() => handleNotificationPress(item)}
          onAvatarPress={() => navigation.navigate('UserProfile', { userId: item.senderId, userName: item.senderName })}
        />
      )}
      ListEmptyComponent={
        !notifLoading ? (
          <View style={[styles.center, { padding: theme.spacing.lg }]}>
            <Text style={styles.empty}>暂无通知</Text>
          </View>
        ) : null
      }
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <Pressable style={styles.tabItem} onPress={() => setActiveTab('chat')}>
          <Text style={[styles.tabText, { color: activeTab === 'chat' ? theme.colors.primary : theme.colors.textSecondary }]}>
            私聊
          </Text>
          {activeTab === 'chat' && <View style={styles.tabIndicator} />}
        </Pressable>
        <Pressable style={styles.tabItem} onPress={() => setActiveTab('notification')}>
          <Text style={[styles.tabText, { color: activeTab === 'notification' ? theme.colors.primary : theme.colors.textSecondary }]}>
            通知
          </Text>
          {activeTab === 'notification' && <View style={styles.tabIndicator} />}
        </Pressable>
      </View>
      {activeTab === 'notification' && notifications.some((n) => !n.isRead) && (
        <Pressable style={styles.markAllBtn} onPress={handleMarkAllRead}>
          <Text style={styles.markAllText}>全部已读</Text>
        </Pressable>
      )}
      {activeTab === 'chat' ? renderChatList() : renderNotificationList()}
    </View>
  );
}
