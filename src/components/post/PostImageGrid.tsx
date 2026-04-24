import React from 'react';
import { Dimensions, Image, Pressable, StyleSheet, View } from 'react-native';
import { PostImage } from '../../types';

const SCREEN_W = Dimensions.get('window').width;
const PAD = 16;
const GAP = 4;
const MAX_COLS = 3;

// 取整避免小数导致换行
const CELL_3COL = Math.floor((SCREEN_W - PAD * 2 - GAP * (MAX_COLS - 1)) / MAX_COLS);
const CELL_2COL = Math.floor((SCREEN_W - PAD * 2 - GAP * 1) / 2);

// 容器宽度 = 列数 * 格子宽 + (列数-1) * 间隙
const WIDTH_3 = CELL_3COL * 3 + GAP * 2;
const WIDTH_2 = CELL_2COL * 2 + GAP;

type Props = {
  images: PostImage[];
  onPressImage?: (index: number) => void;
};

export default function PostImageGrid({ images, onPressImage }: Props) {
  if (!images || images.length === 0) return null;

  const count = images.length;

  let containerStyle: any = styles.container3;
  let itemStyle: any = styles.item3;

  if (count === 1) {
    containerStyle = styles.container1;
    itemStyle = styles.item1;
  } else if (count === 2 || count === 4) {
    containerStyle = styles.container2;
    itemStyle = styles.item2;
  }

  return (
    <View style={containerStyle}>
      {images.map((img, index) => (
        <Pressable key={`${img.imageUrl}-${index}`} onPress={() => onPressImage?.(index)}>
          <Image source={{ uri: img.imageUrl }} style={[styles.image, itemStyle]} resizeMode="cover" />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 6,
    backgroundColor: '#e8ede9',
  },
  container1: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  item1: {
    width: SCREEN_W - PAD * 2,
    height: 220,
  },
  container2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    marginBottom: 12,
    width: WIDTH_2,
  },
  item2: {
    width: CELL_2COL,
    height: CELL_2COL,
  },
  container3: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    marginBottom: 12,
    width: WIDTH_3,
  },
  item3: {
    width: CELL_3COL,
    height: CELL_3COL,
  },
});
