import styled from 'styled-components';

interface ToolbarProps {
    resetGameHandler: () => void;
}

const Container = styled.div`
display: none;
position: fixed;
padding: 8px 4px calc(env(safe-area-inset-bottom) + 8px) 4px;
bottom: 0;
width: 100%;
background-color: transparent;
flex-direction: row;
justify-content: space-around;
align-items: center;

@media (min-width: 40rem) {
    display: flex;
    position: static;
}
`;

const ResetButton = styled.button`
color: #283228;
font-size: 0.75rem;
font-weight: 700;
width: 2.5rem;
height: 2.5rem;
text-align: center;
background-color: white;
border: none;
cursor: pointer;
padding: 0;
border-radius: 8px;
text-transform: uppercase;

&:active {
    opacity: 0.5;
}
`;

const Toolbar = ({ resetGameHandler }: ToolbarProps) => (
    <Container>
        <ResetButton onClick={resetGameHandler}>New</ResetButton>
    </Container>
);

export default Toolbar;
