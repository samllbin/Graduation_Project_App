import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PostImage } from '../../types';
import { CloseIcon } from '../icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

type Props = {
  visible: boolean;
  images: PostImage[];
  initialIndex?: number;
  onClose: () => void;
};

export default function ImageViewer({ visible, images, initialIndex = 0, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const renderItem = ({ item }: { item: PostImage }) => (
    <Pressable onPress={onClose} style={styles.slide}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="contain" />
    </Pressable>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.closeBtn} onPress={onClose}>
          <CloseIcon size={18} color="#fff" />
        </Pressable>

        <FlatList
          data={images}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.imageUrl}-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onScroll={e => {
            const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setCurrentIndex(index);
          }}
        />

        {images.length > 1 && (
          <View style={styles.indicator}>
            <Text style={styles.indicatorText}>
              {currentIndex + 1} / {images.length}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
  closeBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  indicatorText: {
    color: '#fff',
    fontSize: 14,
  },
});
