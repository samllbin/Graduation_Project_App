import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Dialog } from '@rneui/themed';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileMenu from '../../components/profile/ProfileMenu';
import FontSizePicker from '../../components/settings/FontSizePicker';
import ThemePicker from '../../components/settings/ThemePicker';
import { getUserInfo, setUserInfo } from '../../store/authStore';
import { getStoredUserInfo, updateStoredUserInfo } from '../../store/authSession';
import { getUserProfileApi } from '../../api/user';
import { useTheme } from '../../theme/useTheme';

type Props = {
  onLogout: () => void;
};

export default function ProfileScreen({ onLogout }: Props) {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const [user, setUser] = useState<{
    userName: string;
    avatar: string;
    signature: string;
  } | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);

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

  const accountItems = [
    { label: '修改密码', icon: '🔒', onPress: () => navigation.navigate('ChangePassword') },
    { label: '我点赞的帖子', icon: '❤️', onPress: () => navigation.navigate('LikedPosts') },
  ];

  const settingsItems = [
    { label: '字号选择', icon: '🔤', onPress: () => setShowFontPicker(true) },
    { label: '主题选择', icon: '🎨', onPress: () => setShowThemePicker(true) },
  ];

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    onLogout();
  };

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.pageBg }]} contentContainerStyle={styles.content}>
        <ProfileHeader
          userName={user?.userName || ''}
          avatar={user?.avatar || ''}
          signature={user?.signature || ''}
          onUpdate={setUser}
        />

        <View style={[styles.section, { marginBottom: theme.spacing.xl }]} >
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary, fontSize: theme.text.subtitle.fontSize }]}>账号相关</Text>
          <View style={[styles.menuWrap, { backgroundColor: theme.colors.cardBg, borderRadius: theme.radius.lg }]} >
            <ProfileMenu items={accountItems} />
          </View>
        </View>

        <View style={[styles.section, { marginBottom: theme.spacing.xl }]} >
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary, fontSize: theme.text.subtitle.fontSize }]}>通用设置</Text>
          <View style={[styles.menuWrap, { backgroundColor: theme.colors.cardBg, borderRadius: theme.radius.lg }]} >
            <ProfileMenu items={settingsItems} />
          </View>
        </View>

        <Button
          title="退出登录"
          onPress={() => setShowLogoutDialog(true)}
          buttonStyle={[styles.logoutButton, { backgroundColor: theme.colors.danger }]}
          titleStyle={styles.logoutText}
        />
      </ScrollView>

      <Dialog
        isVisible={showLogoutDialog}
        onBackdropPress={() => setShowLogoutDialog(false)}
        overlayStyle={{ backgroundColor: theme.colors.cardBg, borderRadius: theme.radius.lg }}
      >
        <Dialog.Title title="确认退出" titleStyle={{ color: theme.colors.textMain }} />
        <Dialog.Actions>
          <Dialog.Button
            title="取消"
            onPress={() => setShowLogoutDialog(false)}
            titleStyle={{ color: theme.colors.textSecondary }}
          />
          <Dialog.Button
            title="确认退出"
            onPress={confirmLogout}
            titleStyle={{ color: theme.colors.danger }}
          />
        </Dialog.Actions>
      </Dialog>

      <FontSizePicker visible={showFontPicker} onClose={() => setShowFontPicker(false)} />
      <ThemePicker visible={showThemePicker} onClose={() => setShowThemePicker(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  section: {},
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 10,
    paddingLeft: 4,
  },
  menuWrap: {
    overflow: 'hidden',
  },
  logoutButton: {
    height: 46,
    borderRadius: 14,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
