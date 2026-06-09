import styled, { keyframes } from 'styled-components'

interface DrawerQuickBarProps {
  onNewGame: () => void
  onUndo: () => void
  onSuggest: () => void
  onShowPrev: () => void
  isSuggestLoading: boolean
  isPrevLoading: boolean
  onMore?: () => void
  isMoreActive?: boolean
}

const Container = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
`

const Btn = styled.button`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-height: 44px;
  padding: 6px 0;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-accent);

  &:active {
    opacity: 0.5;
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }
  &:disabled:active {
    opacity: 0.5;
  }
`

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const SpinningSvg = styled.svg`
  animation: ${spin} 0.75s linear infinite;
`

const BtnSpinner = () => (
  <SpinningSvg width='20' height='20' viewBox='0 0 20 20' fill='none'>
    <circle
      cx='10'
      cy='10'
      r='7.5'
      stroke='currentColor'
      strokeWidth='1.75'
      strokeOpacity='0.3'
    />
    <path
      d='M10 2.5a7.5 7.5 0 0 1 7.5 7.5'
      stroke='currentColor'
      strokeWidth='1.75'
      strokeLinecap='round'
    />
  </SpinningSvg>
)

const BtnLabel = styled.span`
  font-size: 0.575rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-accent);
  opacity: 0.65;
`

const MoreBtn = styled(Btn)<{ $isActive?: boolean }>`
  display: none;

  @media (min-width: 40rem) {
    display: flex;
    opacity: ${({ $isActive }) => ($isActive ? 1 : 0.75)};

    &:hover {
      opacity: 1;
    }
  }
`

const MoreIcon = () => (
  <svg
    width='20'
    height='20'
    viewBox='0 0 20 20'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.75'
    strokeLinecap='round'
  >
    <line x1='3' y1='6.5' x2='17' y2='6.5' />
    <circle cx='7.5' cy='6.5' r='2.25' />
    <line x1='3' y1='13.5' x2='17' y2='13.5' />
    <circle cx='12.5' cy='13.5' r='2.25' />
  </svg>
)

const RefreshIcon = () => (
  <svg
    width='20'
    height='20'
    viewBox='0 -1 20 20'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.75'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M3.5 10a6.5 6.5 0 1 0 6.5-6.5' />
    <polyline points='12,0.5 8,3.5 12,6.5' />
  </svg>
)

const UndoIcon = () => (
  <svg
    width='20'
    height='20'
    viewBox='0 0 20 20'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.75'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <polyline points='8,5 4,9 8,13' />
    <path d='M4 9h8a4 4 0 0 1 0 8H8' />
  </svg>
)

const HintIcon = () => (
  <svg
    width='20'
    height='20'
    viewBox='0 0 20 20'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.75'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M7 13a5 5 0 1 1 6 0L13 15L7 15Z' />
    <line x1='8.5' y1='17.5' x2='11.5' y2='17.5' />
  </svg>
)

const PrevIcon = () => (
  <svg
    width='20'
    height='20'
    viewBox='0 0 20 20'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.75'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <polyline points='13,4 7,10 13,16' />
  </svg>
)

const DrawerQuickBar = ({
  onNewGame,
  onUndo,
  onSuggest,
  onShowPrev,
  isSuggestLoading,
  isPrevLoading,
  onMore,
  isMoreActive,
}: DrawerQuickBarProps) => (
  <Container>
    <Btn onClick={onNewGame}>
      <RefreshIcon />
      <BtnLabel>New</BtnLabel>
    </Btn>
    <Btn onClick={onUndo}>
      <UndoIcon />
      <BtnLabel>Undo</BtnLabel>
    </Btn>
    <Btn onClick={onSuggest} disabled={isSuggestLoading}>
      {isSuggestLoading ? <BtnSpinner /> : <HintIcon />}
      <BtnLabel>Hint</BtnLabel>
    </Btn>
    <Btn onClick={onShowPrev} disabled={isPrevLoading}>
      {isPrevLoading ? <BtnSpinner /> : <PrevIcon />}
      <BtnLabel>Prev</BtnLabel>
    </Btn>
    <MoreBtn onClick={onMore} $isActive={isMoreActive}>
      <MoreIcon />
      <BtnLabel>More</BtnLabel>
    </MoreBtn>
  </Container>
)

export default DrawerQuickBar
