let visible = true;
let cb: ((v: boolean) => void) | null = null;

export const setTabBarVisible = (v: boolean) => {
  visible = v;
  cb?.(v);
};

export const getTabBarVisible = () => visible;

export const subscribeTabBarVisible = (listener: (v: boolean) => void) => {
  cb = listener;
  return () => { cb = null; };
};
