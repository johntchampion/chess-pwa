import styled from 'styled-components'

const Button = styled.button<{
  $variant?: 'primary' | 'secondary'
  $flex?: number
}>`
  font-size: 0.9rem;
  font-weight: 700;
  padding: 0 8px;
  height: 2.5rem;
  border-radius: 12px;
  border: none;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;
  flex: ${({ $flex }) => $flex ?? 0};
  background: ${({ $variant }) =>
    $variant === 'secondary' ? 'transparent' : 'var(--color-btn-bg)'};
  color: ${({ $variant }) =>
    $variant === 'secondary'
      ? 'var(--color-text-primary)'
      : 'var(--color-btn-text)'};

  &:active {
    opacity: 0.5;
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`

export default Button
