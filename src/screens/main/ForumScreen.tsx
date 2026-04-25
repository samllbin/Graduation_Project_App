import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import PostCard from '../../components/post/PostCard';
import { getPostListApi, likePostApi, unlikePostApi } from '../../api/post';
import { PostItem } from '../../types';
import { useTheme } from '../../theme/useTheme';
import {
  ChevronDownIcon,
  CloseIcon,
  DoubleColumnIcon,
  PlusIcon,
  SearchIcon,
  SingleColumnIcon,
} from '../../components/icons';

type FilterOption = { label: string; value: string | undefined };

const timeOptions: FilterOption[] = [
  { label: '全部时间', value: undefined },
  { label: '今天', value: 'day' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
];

const imageOptions: FilterOption[] = [
  { label: '全部内容', value: undefined },
  { label: '有图', value: 'true' },
  { label: '无图', value: 'false' },
];

const sortOptions: FilterOption[] = [
  { label: '最新发布', value: 'time' },
  { label: '最多喜欢', value: 'likes' },
  { label: '最多浏览', value: 'views' },
];

export default function ForumScreen() {
  const navigation = useNavigation<any>();
  const theme = useTheme();

  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [timeRange, setTimeRange] = useState<string | undefined>(undefined);
  const [hasImage, setHasImage] = useState<string | undefined>(undefined);
  const [layout, setLayout] = useState<'single' | 'double'>('single');

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const [sortBy, setSortBy] = useState<string>('time');
  const [showSortPicker, setShowSortPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const closeAllPickers = () => {
    setShowSortPicker(false);
    setShowTimePicker(false);
    setShowImagePicker(false);
  };

  // debounce keyword
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const fetch = useCallback(
    async (targetPage: number, isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else if (targetPage === 1) setLoading(true);
        else setLoadingMore(true);
        setError('');

        const res = await getPostListApi(
          sortBy,
          targetPage,
          layout === 'double' ? 20 : 10,
          debouncedKeyword || undefined,
          hasImage,
          timeRange,
        );
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
    },
    [debouncedKeyword, hasImage, timeRange, layout, sortBy],
  );

  useEffect(() => {
    fetch(1, false);
  }, [fetch]);

  useFocusEffect(
    useCallback(() => {
      fetch(1, true);
    }, [fetch]),
  );

  const onRefresh = () => fetch(1, true);
  const onLoadMore = () => {
    if (loadingMore || page >= totalPages) return;
    fetch(page + 1);
  };

  const handleLikeToggle = async (postId: number, liked: boolean) => {
    const id = Number(postId);
    try {
      if (liked) {
        await likePostApi(id);
      } else {
        await unlikePostApi(id);
      }
      setPosts((prev) =>
        prev.map((p) =>
          Number(p.id) === id
            ? { ...p, liked, likeCount: liked ? p.likeCount + 1 : Math.max(p.likeCount - 1, 0) }
            : p,
        ),
      );
    } catch {}
  };

  const handlePostPress = (post: PostItem) => {
    navigation.navigate('PostDetail', { postId: post.id });
  };

  const renderItem = ({ item }: { item: PostItem }) => (
    <PostCard
      post={item}
      onLikeToggle={handleLikeToggle}
      onPress={handlePostPress}
      compact={layout === 'double'}
    />
  );

  const activeSortLabel = sortOptions.find((o) => o.value === sortBy)?.label || '最新发布';
  const activeTimeLabel = timeOptions.find((o) => o.value === timeRange)?.label || '全部时间';
  const activeImageLabel = imageOptions.find((o) => o.value === hasImage)?.label || '全部内容';

  const FilterPicker = ({
    visible,
    onClose,
    options,
    value,
    onSelect,
    title,
  }: {
    visible: boolean;
    onClose: () => void;
    options: FilterOption[];
    value: string | undefined;
    onSelect: (v: string | undefined) => void;
    title: string;
  }) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={filterStyles.overlay} onPress={onClose}>
        <View style={[filterStyles.panel, { backgroundColor: theme.colors.cardBg }]}>
          <Text
            style={[
              filterStyles.panelTitle,
              { color: theme.colors.textMain, fontSize: Math.round(16 * theme.fontScale) },
            ]}
          >
            {title}
          </Text>
          {options.map((opt) => {
            const active = value === opt.value;
            return (
              <Pressable
                key={opt.label}
                style={[
                  filterStyles.option,
                  {
                    borderColor: active ? theme.colors.primary : theme.colors.border,
                    backgroundColor: active ? theme.colors.primarySoft : 'transparent',
                  },
                ]}
                onPress={() => {
                  onSelect(opt.value);
                  onClose();
                }}
              >
                <Text
                  style={[
                    filterStyles.optionText,
                    { color: theme.colors.textMain, fontSize: Math.round(14 * theme.fontScale) },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );

  if (loading && posts.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.pageBg }]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.pageBg }}>
      {/* Search */}
      <View
        style={[
          styles.searchWrap,
          {
            backgroundColor: theme.colors.cardBg,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.searchInputWrap,
            {
              backgroundColor: theme.colors.pageBg,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <SearchIcon size={14} color={theme.colors.textSecondary} />
          <TextInput
            style={[
              styles.searchInput,
              { color: theme.colors.textMain, fontSize: Math.round(14 * theme.fontScale) },
            ]}
            placeholder="搜索帖子标题或内容"
            placeholderTextColor={theme.colors.textSecondary}
            value={keyword}
            onChangeText={setKeyword}
            returnKeyType="search"
          />
          {!!keyword && (
            <Pressable onPress={() => setKeyword('')}>
              <CloseIcon size={14} color="#999" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter bar */}
      <View
        style={[
          styles.filterBar,
          {
            backgroundColor: theme.colors.cardBg,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <Pressable style={styles.filterBtn} onPress={() => setShowSortPicker(true)}>
          <Text
            style={[
              styles.filterBtnText,
              { color: sortBy !== 'time' ? theme.colors.primary : theme.colors.textSecondary },
            ]}
          >
            {activeSortLabel}
          </Text>
          <ChevronDownIcon size={10} color={theme.colors.textSecondary} />
        </Pressable>

        <Pressable style={styles.filterBtn} onPress={() => setShowTimePicker(true)}>
          <Text
            style={[
              styles.filterBtnText,
              { color: timeRange ? theme.colors.primary : theme.colors.textSecondary },
            ]}
          >
            {activeTimeLabel}
          </Text>
          <ChevronDownIcon size={10} color={theme.colors.textSecondary} />
        </Pressable>

        <Pressable style={styles.filterBtn} onPress={() => setShowImagePicker(true)}>
          <Text
            style={[
              styles.filterBtnText,
              { color: hasImage ? theme.colors.primary : theme.colors.textSecondary },
            ]}
          >
            {activeImageLabel}
          </Text>
          <ChevronDownIcon size={10} color={theme.colors.textSecondary} />
        </Pressable>

        <View style={styles.layoutSwitch}>
          <Pressable
            style={[
              styles.layoutBtn,
              layout === 'single' && {
                backgroundColor: theme.colors.primarySoft,
              },
            ]}
            onPress={() => setLayout('single')}
          >
            <Text
              style={[
                styles.layoutBtnText,
                { color: layout === 'single' ? theme.colors.primary : theme.colors.textSecondary },
              ]}
            >
              <SingleColumnIcon size={16} color={layout === 'single' ? theme.colors.primary : theme.colors.textSecondary} />
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.layoutBtn,
              layout === 'double' && {
                backgroundColor: theme.colors.primarySoft,
              },
            ]}
            onPress={() => setLayout('double')}
          >
            <Text
              style={[
                styles.layoutBtnText,
                { color: layout === 'double' ? theme.colors.primary : theme.colors.textSecondary },
              ]}
            >
              <DoubleColumnIcon size={16} color={layout === 'double' ? theme.colors.primary : theme.colors.textSecondary} />
            </Text>
          </Pressable>
        </View>
      </View>

      <FilterPicker
        visible={showSortPicker}
        onClose={() => setShowSortPicker(false)}
        options={sortOptions}
        value={sortBy}
        onSelect={setSortBy}
        title="排序方式"
      />
      <FilterPicker
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        options={timeOptions}
        value={timeRange}
        onSelect={setTimeRange}
        title="时间筛选"
      />
      <FilterPicker
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        options={imageOptions}
        value={hasImage}
        onSelect={setHasImage}
        title="内容筛选"
      />

      {!!error && posts.length === 0 && (
        <View style={[styles.center, { backgroundColor: theme.colors.pageBg, padding: theme.spacing.lg }]}>
          <Text style={[styles.error, { color: theme.colors.danger, marginBottom: theme.spacing.md }]}>
            {error}
          </Text>
          <Pressable
            style={[
              styles.retry,
              {
                backgroundColor: theme.colors.primarySoft,
                paddingHorizontal: theme.spacing.lg,
                paddingVertical: theme.spacing.sm,
                borderRadius: theme.radius.md,
              },
            ]}
            onPress={onRefresh}
          >
            <Text style={[styles.retryText, { color: theme.colors.primary }]}>重试</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        key={layout}
        data={posts}
        numColumns={layout === 'double' ? 2 : 1}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: theme.spacing.xl,
        }}
        columnWrapperStyle={
          layout === 'double'
            ? { gap: theme.spacing.md }
            : undefined
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={{ marginVertical: theme.spacing.md }} color={theme.colors.primary} />
          ) : null
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View style={[styles.center, { backgroundColor: theme.colors.pageBg, padding: theme.spacing.lg }]}>
              <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
                {debouncedKeyword ? '没有找到相关帖子' : '还没有帖子'}
              </Text>
            </View>
          ) : null
        }
      />

      <Pressable
        style={{
          position: 'absolute',
          right: theme.spacing.lg,
          bottom: theme.spacing.lg + 60,
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: theme.colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        }}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <PlusIcon size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { fontSize: 14 },
  retry: {},
  retryText: { fontWeight: '600' },
  empty: { fontSize: 15 },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
    gap: 6,
  },
  searchIcon: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: '#999',
    paddingHorizontal: 4,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 12,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  filterArrow: {
    fontSize: 10,
  },
  layoutSwitch: {
    flexDirection: 'row',
    marginLeft: 'auto',
    gap: 4,
  },
  layoutBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layoutBtnText: {
    fontSize: 16,
  },
});

const filterStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    gap: 10,
  },
  panelTitle: {
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  option: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  optionText: {
    fontWeight: '600',
  },
});
