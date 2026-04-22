export type MainTabKey = 'imageRecognition' | 'forum' | 'profile';

export type MainTabItem = {
  key: MainTabKey;
  name: string;
  title: string;
  icon: string;
};

export const mainTabItems: MainTabItem[] = [
  {
    key: 'imageRecognition',
    name: 'ImageRecognition',
    title: '图像识别',
    icon: '🌿',
  },
  {
    key: 'forum',
    name: 'Forum',
    title: '问题论坛',
    icon: '💬',
  },
  {
    key: 'profile',
    name: 'Profile',
    title: '个人中心',
    icon: '👤',
  },
];

