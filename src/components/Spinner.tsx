import styled, { keyframes } from 'styled-components';

interface SpinnerProps {
    hidden: boolean;
}

const rotate = keyframes`
from { transform: rotate(0); }
to { transform: rotate(360deg); }
`;

const Container = styled.div<{ $hidden: boolean }>`
display: inline-block;
height: 24px;
width: 24px;
opacity: ${({ $hidden }) => $hidden ? '0' : '0.5'};
transition: opacity 0.2s linear;
animation-name: ${rotate};
animation-duration: 0.75s;
animation-iteration-count: infinite;
animation-timing-function: linear;

@media (min-width: 40rem) {
    height: 32px;
    width: 32px;
}
`;

const Arc = styled.circle`
fill: none;
stroke: #FFFFFF;
stroke-width: 3;
stroke-dasharray: 60;
`;

const Spinner = ({ hidden }: SpinnerProps) => (
    <Container $hidden={hidden}>
        <svg viewBox="0 0 24 24">
            <Arc r="10.5" cx="50%" cy="50%" />
        </svg>
    </Container>
);

export default Spinner;
