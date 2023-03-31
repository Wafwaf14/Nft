import styled from "styled-components";
import { animated } from "@react-spring/web";

export const ContainerApp = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: #0d0b21;
  display: flex;
  justify-content: center;
  align-items: center;

  overflow: hidden;
  position: relative;
`;

export const ContainerAnimated = styled(animated.div)`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
`;

export const ConnectContainer = styled(animated.div)`
  min-height: 300px;
  width: 500px;
  background-color: #1c1a33;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0px 32px;
`;

export const ConnectButton = styled.button`
  padding: 16px 16px;
  background-color: #730484;
  border-radius: 8px;
  border: 0px;
  box-shadow: 5px 5px 15px 5px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  width: 100%;
`;

export const StackingContainer = styled.div`
  padding: 16px;
  border-radius: 20px;
  background-color: #355a96;
  width: 600px;
  display: flex;
  gap: 8px;
  overflow: hidden;
  flex-direction: column;
`;

export const NFTCard = styled.div`
  height: 150px;
  width: 150px;
  min-height: 150px;
  min-width: 150px;
  max-height: 150px;
  max-width: 150px;
  background-color: #939ca3;
  border-radius: 8px;
  overflow: hidden;
`;

export const ListNFTContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  padding: 8px 0px;
  flex-direction: column;
  gap: 16px;
`;

export const TextCustom = styled.p`
  font-size: 30px;
  font-family: Arial, Helvetica, sans-serif;
  color: #ffffff;
  margin: 0px;
`;


export const ContainerStaking = styled.div`
width: 70%;
padding: 16px 32px;
background-color: rgb(28, 26, 51);
border-radius: 32px;
`;

export const HeaderStaking = styled.div`

width: 100%;
display: grid;
grid-template-columns: 1fr 1fr 1fr;
`

export const LogoContainer = styled.div`
display: flex;
justify-content: center;
align-items: center;

`

export const IconWrapper = styled.div`
height: 16px;
width: 16px;
position: relative;
display: flex;
align-items: center;
justify-content: center;
`;

export const EnterPlatform = styled.div`
background: linear-gradient(0.25turn,  #59c173B3,  #a17fe0B3,  #5d26c1B3); /* Chrome 10-25, Safari 5.1-6 */
padding: 8px 16px;
border-radius: 16px;
cursor: pointer;

box-shadow:1px 8px 15px 3px rgba(0,0,0,0.61);
& > p {
  opacity: 1;
}
`
