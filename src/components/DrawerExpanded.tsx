import styled from 'styled-components'
import type { ColorChoice } from '../hooks/useGame'

interface DrawerExpandedProps {
  difficulty: number
  onChangeDifficulty: () => void
  onSwitchColor: () => void
  preferredColor: ColorChoice
  historyLength: number
  onViewHistory: () => void
}

const COLOR_LABELS: Record<ColorChoice, string> = {
  w: 'White',
  b: 'Black',
  random: 'Random',
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  gap: 10px;
`

const SettingButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 18px;
  background-color: #2e3d2e;
  border: none;
  border-radius: 0.75rem;
  color: #ededed;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  text-align: left;

  &:active {
    opacity: 0.7;
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`

const ValueLabel = styled.span`
  color: #9ab89a;
  font-size: 0.85rem;
  font-weight: 500;
`

const DrawerExpanded = ({ difficulty, onChangeDifficulty, onSwitchColor, preferredColor, historyLength, onViewHistory }: DrawerExpandedProps) => (
  <Container>
    <SettingButton onClick={onChangeDifficulty}>
      Change Difficulty
      <ValueLabel>{difficulty}</ValueLabel>
    </SettingButton>
    <SettingButton onClick={onSwitchColor}>
      Switch Color
      <ValueLabel>{COLOR_LABELS[preferredColor]}</ValueLabel>
    </SettingButton>
    <SettingButton onClick={onViewHistory} disabled={historyLength === 0}>
      View History
      <ValueLabel>{historyLength === 0 ? 'No moves' : `${historyLength} move${historyLength === 1 ? '' : 's'}`}</ValueLabel>
    </SettingButton>
  </Container>
)

export default DrawerExpanded
