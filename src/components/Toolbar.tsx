import styled from 'styled-components'

interface ToolbarProps {
  resetGameHandler: () => void
  undoMoveHandler: () => void
  suggestMoveHandler: () => void
  showPreviousMoveHandler: () => void
}

const Container = styled.div`
  display: flex;
  position: static;
  padding: 8px;
  bottom: 0;
  width: 100%;
  background-color: transparent;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const Button = styled.button`
  color: #283228;
  font-size: 0.75rem;
  font-weight: 700;
  width: 2.75rem;
  height: 2.75rem;
  text-align: center;
  background-color: #ededed;
  box-shadow: 1px 2px 2px #cccccc;
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

const Toolbar = ({
  resetGameHandler,
  undoMoveHandler,
  suggestMoveHandler,
  showPreviousMoveHandler,
}: ToolbarProps) => (
  <Container>
    <Button onClick={resetGameHandler}>New</Button>
    <Button onClick={undoMoveHandler}>Undo</Button>
    <Button onClick={suggestMoveHandler}>Sug</Button>
    <Button onClick={showPreviousMoveHandler}>SWPV</Button>
  </Container>
)

export default Toolbar
