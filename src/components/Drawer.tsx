import { useState } from 'react'
import type { ReactNode } from 'react'
import { useDrag } from '@use-gesture/react'
import { animated, useSpring } from 'react-spring'
import styled from 'styled-components'

// Height of the drag-bar pill + its top/bottom margins.
const DRAG_BAR_REGION_HEIGHT = 14;

// How tall the drawer grows when fully open.
const EXPANDED_HEIGHT = 380;

interface DrawerProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  /** Content shown in the always-visible peek strip. */
  peekContent: ReactNode;
  /**
   * A stable string key that identifies the current peekContent.
   * Changing this key remounts the content and triggers a fade-in.
   */
  peekContentKey: string;
  /** Content revealed only when the drawer is open. */
  expandedContent?: ReactNode;
  /**
   * Height of the peek strip in pixels (not including the drag bar).
   * Defaults to 72. Pass a larger value for sub-mode controls that
   * need more vertical room.
   */
  peekHeight?: number;
}

const DrawerContainer = styled(animated.div)`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #1e2a1e;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  touch-action: none;
  z-index: 5;
  /* Clips the spring-height animation and any expanded-content overflow. */
  overflow: hidden;
`

const DragBar = styled.div`
  display: block;
  margin: 4px auto;
  width: 75px;
  height: 6px;
  border-radius: 3px;
  background-color: #4a6040;
`

const PeekStrip = styled.div<{ $height: number }>`
  position: relative;
  height: ${({ $height }) => $height}px;
  overflow: hidden;
`

// Fills the PeekStrip absolutely so content always covers edge-to-edge.
const PeekFillDiv = styled(animated.div)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
`

// Mounts fresh (and fades in) whenever its `key` changes.
// Old content disappears instantly via React unmount; new content fades in.
// The mode transition always happens while the drawer spring is already
// closing, so only the fade-in is perceptible to the user.
const PeekFade = ({ children }: { children: ReactNode }) => {
  const style = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 200 },
  });
  return <PeekFillDiv style={style}>{children}</PeekFillDiv>;
};

const Drawer = ({
  isOpen,
  onOpen,
  onClose,
  peekContent,
  peekContentKey,
  expandedContent,
  peekHeight = 72,
}: DrawerProps) => {
  const [dragOffset, setDragOffset] = useState(0);

  // Target height: base (open or closed) adjusted by live drag offset.
  const baseHeight = isOpen ? EXPANDED_HEIGHT : DRAG_BAR_REGION_HEIGHT + peekHeight;
  const targetHeight = baseHeight + dragOffset;

  const bind = useDrag(
    ({ last, movement: [, dy] }) => {
      if (last) {
        // dy < 0 = dragged upward = open; dy > 0 = dragged downward = close.
        if (dy <= 0) onOpen(); else onClose();
        setDragOffset(0);
      } else {
        setDragOffset(-dy);
      }
    },
    { axis: 'y' },
  );

  const springStyles = useSpring({
    height: targetHeight,
    config: { tension: 170, mass: 0.2, friction: 10 },
  });

  return (
    <DrawerContainer style={{ height: springStyles.height }} {...bind()}>
      <DragBar />
      <PeekStrip $height={peekHeight}>
        {/* key forces a remount — and a fresh fade-in — whenever the mode changes */}
        <PeekFade key={peekContentKey}>
          {peekContent}
        </PeekFade>
      </PeekStrip>
      {expandedContent}
    </DrawerContainer>
  );
};

export default Drawer;
