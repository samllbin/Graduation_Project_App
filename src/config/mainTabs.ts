export type MainTabKey = 'imageRecognition' | 'forum' | 'message' | 'profile';

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
    title: '识别',
    icon: '🌿',
  },
  {
    key: 'forum',
    name: 'Forum',
    title: '论坛',
    icon: '💬',
  },
  {
    key: 'message',
    name: 'Message',
    title: '消息',
    icon: '✉️',
  },
  {
    key: 'profile',
    name: 'Profile',
    title: '个人',
    icon: '👤',
  },
];
