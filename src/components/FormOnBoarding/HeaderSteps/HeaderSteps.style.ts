import { animated } from "@react-spring/web";
import styled from "styled-components";

export const HeaderStepsLine = styled.div`
    width: 100%;
	height: 5px;
	background: #464366;
	position: relative;
	border-radius: 10px;
	overflow: visible;
`;

export const Dot = styled.div`
position: absolute;
	top: calc(50% - 8px);
	width: 15px;
	height: 15px;
	left: 0%;
	
	background: #fff;
	border-radius: 50%;

    display:flex;
    justify-content: center;
    align-items: center;
`; 

export const DotCenter1 = styled(Dot)`
left: calc(33% - 8px);
`;

export const DotCenter2 = styled(Dot)`
left: calc(66% - 8px);
`;

export const DotFinal = styled(Dot)`
left: calc(100% - 8px);
`;

export const ContainerStepTitle = styled.div` 
    position: relative;
	
	height: 25px;
    padding: 0px 0px;
	display: flex;
	justify-content: center;
	text-align: center;
	
`;

export const TitleStep = styled.span`
    line-height: 25px;
	height: 25px;
	margin: 0;
	color: #777;
	font-family: 'Roboto', sans-serif;
	font-size: .9rem;
	font-weight: 300;
    text-align: center;
`;

export const Line = styled(animated.div)`
    height: 1px;
    background-color: #fff;
    position:absolute;
    top: 50%;
`;

export const DotAnimated = styled(animated(Dot))`
display:flex;
justify-content: center;
align-items: center;
`;

export const SmallDot = styled(Dot)`
background-color: #38e25d;
position:relative;
border: 4px solid #ffffff;
`;

