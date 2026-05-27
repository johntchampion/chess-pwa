import { useState } from 'react';

export type DrawerMode = 'default' | 'difficulty' | 'color';

const useDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<DrawerMode>('default');

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  // Entering a sub-mode also closes the drawer so the control
  // is visible in the peek strip rather than the expanded panel.
  const enterSubMode = (newMode: Exclude<DrawerMode, 'default'>) => {
    setMode(newMode);
    setIsOpen(false);
  };

  // Exiting a sub-mode returns the peek strip to the default quick-bar.
  const exitSubMode = () => setMode('default');

  return { isOpen, mode, openDrawer, closeDrawer, enterSubMode, exitSubMode };
};

export default useDrawer;
