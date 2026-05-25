import { useState } from 'react'
import type { ReactNode } from 'react'
import { useDrag } from '@use-gesture/react'
import { animated, useSpring } from 'react-spring'
import styled from 'styled-components'

interface DrawerProps {
  children?: ReactNode
  backgroundColor?: string
  borderRadius?: string
}

const DrawerContainer = styled(animated.div)`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: gray;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  touch-action: none;
  z-index: 5;
`

const DragBar = styled.div`
  display: block;
  position: absolute;
  margin: 4px auto;
  left: 0;
  right: 0;
  padding: 0;
  width: 75px;
  height: 6px;
  border-radius: 3px;
  background-color: #dddddd;
`

const Drawer = ({ children }: DrawerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)

  const safeAreaBottom = getComputedStyle(document.documentElement)
    .getPropertyPriority('--sab')
    .slice(0, -2)

  let drawerHeight = 60
  if (dragOffset === 0) {
    drawerHeight = isOpen ? 600 : drawerHeight
  } else {
    drawerHeight = (isOpen ? 600 : drawerHeight) + dragOffset
  }

  const bind = useDrag(
    ({ last, movement: [_, dy] }) => {
      if (last) {
        setIsOpen(dy <= 0)
        setDragOffset(0)
      } else {
        setDragOffset(-dy)
      }
    },
    {
      axis: 'y',
    },
  )

  const styles = useSpring({
    height: drawerHeight + safeAreaBottom + 'px',
    config: {
      tension: 170,
      mass: 0.2,
      friction: 10,
    },
  })

  return (
    <DrawerContainer style={styles} {...bind()}>
      <DragBar />
      {children}
    </DrawerContainer>
  )
}

export default Drawer
