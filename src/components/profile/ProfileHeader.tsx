import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Avatar } from '@rneui/themed';
import { launchImageLibrary } from 'react-native-image-picker';
import { updateProfileApi, uploadImageApi } from '../../api/user';
import { setUserInfo } from '../../store/authStore';
import { updateStoredUserInfo } from '../../store/authSession';
import { useTheme } from '../../theme/useTheme';

type Props = {
  userName: string;
  avatar: string;
  signature: string;
  onUpdate: (u: { userName: string; avatar: string; signature: string }) => void;
};

export default function ProfileHeader({ userName, avatar, signature, onUpdate }: Props) {
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(signature);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.didCancel || !result.assets?.length) return;
    const asset = result.assets[0];
    const uri = asset.uri;
    if (!uri) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: asset.fileName || 'avatar.jpg',
        type: asset.type || 'image/jpeg',
      } as any);
      const res = await uploadImageApi(formData);
      if (res.data?.url) {
        await saveField({ avatar: res.data.url });
      }
    } catch {}
    setUploading(false);
  };

  const saveField = async (patch: { avatar?: string; signature?: string }) => {
    const res = await updateProfileApi(patch);
    if (res.code === 200 && res.data) {
      const info = {
        id: res.data.id,
        userName: res.data.userName,
        avatar: res.data.avatar,
        signature: res.data.signature,
      };
      setUserInfo(info);
      await updateStoredUserInfo(info);
      onUpdate(info);
    }
  };

  const confirmSignature = async () => {
    setEditing(false);
    if (draft !== signature) {
      await saveField({ signature: draft });
    }
  };

  const styles = StyleSheet.create({
    wrap: { alignItems: 'center', marginBottom: theme.spacing.xl },
    avatarContainer: { backgroundColor: theme.colors.border },
    avatarImage: { resizeMode: 'cover' },
    name: {
      marginTop: theme.spacing.md,
      fontSize: Math.round(20 * theme.fontScale),
      fontWeight: '700',
      color: theme.colors.textMain,
    },
    signature: {
      marginTop: theme.spacing.xs,
      fontSize: Math.round(14 * theme.fontScale),
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    hint: { marginTop: 2, fontSize: 12, color: theme.colors.primary, textAlign: 'center' },
    editWrap: { marginTop: theme.spacing.sm, width: '100%', alignItems: 'center' },
    input: {
      width: '100%',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: Math.round(14 * theme.fontScale),
      color: theme.colors.textMain,
      backgroundColor: theme.colors.cardBg,
      textAlign: 'center',
      minHeight: 60,
    },
    actions: { flexDirection: 'row', marginTop: theme.spacing.xs, gap: theme.spacing.lg },
    confirm: { color: theme.colors.primary, fontWeight: '600', fontSize: Math.round(14 * theme.fontScale) },
    cancel: { color: theme.colors.textSecondary, fontSize: Math.round(14 * theme.fontScale) },
  });

  return (
    <View style={styles.wrap}>
      <Pressable onPress={pickImage} disabled={uploading}>
        <Avatar
          size={88}
          rounded
          source={avatar ? { uri: avatar } : undefined}
          containerStyle={styles.avatarContainer}
          avatarStyle={styles.avatarImage}
        >
          {uploading && <ActivityIndicator color="#fff" />}
        </Avatar>
      </Pressable>

      <Text style={styles.name}>{userName || '加载中...'}</Text>

      {editing ? (
        <View style={styles.editWrap}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            maxLength={100}
            multiline
            autoFocus
          />
          <View style={styles.actions}>
            <Pressable onPress={confirmSignature}>
              <Text style={styles.confirm}>保存</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setEditing(false);
                setDraft(signature);
              }}
            >
              <Text style={styles.cancel}>取消</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable onPress={() => setEditing(true)}>
          <Text style={styles.signature}>{signature || '这个人很懒，什么都没写'}</Text>
          <Text style={styles.hint}>点击修改签名</Text>
        </Pressable>
      )}
    </View>
  );
}
