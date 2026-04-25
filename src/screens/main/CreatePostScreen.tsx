import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { createPostApi, uploadImageApi } from '../../api/post';
import { useTheme } from '../../theme/useTheme';
import { CloseIcon, PlusIcon } from '../../components/icons';

export default function CreatePostScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<Array<{ uri: string; url?: string }>>([]);
  const [submitting, setSubmitting] = useState(false);

  const handlePickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 9 - images.length,
      },
      response => {
        if (response.assets) {
          const newImages = response.assets.map(asset => ({
            uri: asset.uri || '',
          }));
          setImages(prev => [...prev, ...newImages].slice(0, 9));
        }
      },
    );
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      Alert.alert('提示', '请填写内容或上传图片');
      return;
    }

    try {
      setSubmitting(true);

      const uploadedImages = [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const file = {
          uri: img.uri,
          name: `image_${i}.jpg`,
          type: 'image/jpeg',
        };
        const res = await uploadImageApi(file);
        if (res.code === 200 && res.data?.url) {
          uploadedImages.push({
            imageUrl: res.data.url,
            sortOrder: i + 1,
          });
        }
      }

      const res = await createPostApi({
        title: title.trim() || undefined,
        contentText: content.trim() || undefined,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
      });

      if (res.code === 200) {
        Alert.alert('发布成功', '', [
          { text: '确定', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('发布失败', res.message || '请重试');
      }
    } catch (e: any) {
      Alert.alert('发布失败', e?.message || '网络错误');
    } finally {
      setSubmitting(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.pageBg },
    scroll: { flex: 1, padding: theme.spacing.lg },
    titleInput: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: Math.round(16 * theme.fontScale),
      fontWeight: '600',
      color: theme.colors.textMain,
      marginBottom: theme.spacing.md,
    },
    contentInput: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: Math.round(15 * theme.fontScale),
      color: theme.colors.textMain,
      minHeight: 120,
      marginBottom: theme.spacing.md,
    },
    imageGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    imageWrap: {
      width: 100,
      height: 100,
      borderRadius: theme.radius.md,
      overflow: 'hidden',
      position: 'relative',
    },
    previewImage: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.colors.border,
    },
    removeBtn: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    removeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    addBtn: {
      width: 100,
      height: 100,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.cardBg,
    },
    addText: {
      fontSize: 32,
      color: theme.colors.primary,
      fontWeight: '300',
    },
    footer: {
      padding: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.cardBg,
    },
    submitBtn: {
      backgroundColor: theme.colors.primary,
      height: 46,
      borderRadius: theme.radius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    submitBtnDisabled: {
      backgroundColor: theme.colors.border,
    },
    submitText: {
      color: '#fff',
      fontSize: Math.round(16 * theme.fontScale),
      fontWeight: '600',
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <TextInput
          style={styles.titleInput}
          placeholder="标题（可选）"
          placeholderTextColor={theme.colors.textSecondary}
          value={title}
          onChangeText={setTitle}
          maxLength={50}
        />

        <TextInput
          style={styles.contentInput}
          placeholder="分享你的农业经验或问题..."
          placeholderTextColor={theme.colors.textSecondary}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          maxLength={2000}
        />

        <View style={styles.imageGrid}>
          {images.map((img, index) => (
            <View key={`${img.uri}-${index}`} style={styles.imageWrap}>
              <Image source={{ uri: img.uri }} style={styles.previewImage} resizeMode="cover" />
              <Pressable style={styles.removeBtn} onPress={() => handleRemoveImage(index)}>
                <CloseIcon size={12} color="#fff" />
              </Pressable>
            </View>
          ))}

          {images.length < 9 && (
            <Pressable style={styles.addBtn} onPress={handlePickImage}>
              <PlusIcon size={32} color={theme.colors.primary} />
            </Pressable>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>发布</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
