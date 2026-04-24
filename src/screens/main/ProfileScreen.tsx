import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@rneui/themed';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileMenu from '../../components/profile/ProfileMenu';
import { getUserInfo, setUserInfo } from '../../store/authStore';
import { getStoredUserInfo, updateStoredUserInfo } from '../../store/authSession';
import { getUserProfileApi } from '../../api/user';
import { agriTheme } from '../../theme/agriTheme';

type Props = {
  onLogout: () => void;
};

export default function ProfileScreen({ onLogout }: Props) {
  const navigation = useNavigation<any>();
  const [user, setUser] = useState<{
    userName: string;
    avatar: string;
    signature: string;
  } | null>(null);

  const loadUser = useCallback(async () => {
    const memory = getUserInfo();
    if (memory) setUser(memory);
    const stored = await getStoredUserInfo();
    if (stored) setUser(stored);
    if (memory?.userName || stored?.userName) {
      try {
        const name = memory?.userName || stored?.userName || '';
        const res = await getUserProfileApi(name);
        if (res.data) {
          const info = {
            id: res.data.id,
            userName: res.data.userName,
            avatar: res.data.avatar,
            signature: res.data.signature,
          };
          setUser(info);
          setUserInfo(info);
          await updateStoredUserInfo(info);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const menuItems = [
    { label: '修改密码', icon: '🔒', onPress: () => navigation.navigate('ChangePassword') },
    { label: '我点赞的帖子', icon: '❤️', onPress: () => navigation.navigate('LikedPosts') },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ProfileHeader
        userName={user?.userName || ''}
        avatar={user?.avatar || ''}
        signature={user?.signature || ''}
        onUpdate={setUser}
      />

      <View style={styles.menuWrap}>
        <ProfileMenu items={menuItems} />
      </View>

      <Button
        title="退出登录"
        onPress={onLogout}
        buttonStyle={styles.logoutButton}
        titleStyle={styles.logoutText}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: agriTheme.colors.pageBg,
  },
  content: {
    paddingHorizontal: agriTheme.spacing.lg,
    paddingTop: agriTheme.spacing.xl,
    paddingBottom: agriTheme.spacing.xl,
  },
  menuWrap: {
    marginBottom: agriTheme.spacing.xl,
  },
  logoutButton: {
    backgroundColor: agriTheme.colors.danger,
    height: 46,
    borderRadius: agriTheme.radius.md,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
