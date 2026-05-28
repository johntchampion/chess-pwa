import styled from 'styled-components'

interface DrawerQuickBarProps {
  onNewGame: () => void
  onUndo: () => void
  onSuggest: () => void
  onShowPrev: () => void
}

const Container = styled.div`
  display: flex;
  width: 100%;
  padding: 0 8px;
  justify-content: space-between;
  align-items: center;
`

const Button = styled.button`
  color: #283228;
  font-size: 0.75rem;
  font-weight: 700;
  width: 2.75rem;
  height: 2.75rem;
  background-color: #ededed;
  border: none;
  cursor: pointer;
  padding: 0;
  border-radius: 1.375rem;
  text-transform: uppercase;
  margin: 0 16px;

  &:active {
    opacity: 0.5;
  }
`

const DrawerQuickBar = ({ onNewGame, onUndo, onSuggest, onShowPrev }: DrawerQuickBarProps) => (
  <Container>
    <Button onClick={onNewGame}>New</Button>
    <Button onClick={onUndo}>Undo</Button>
    <Button onClick={onSuggest}>Sug</Button>
    <Button onClick={onShowPrev}>Prev</Button>
  </Container>
)

export default DrawerQuickBar
