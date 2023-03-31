import styled from "styled-components";
import {  animated } from "@react-spring/web";

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
  padding: 12px 32px;
  position:relative;
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
  height: 100px;
  width: 100px;
  min-height: 100px;
  min-width: 100px;
  max-height: 100px;
  max-width: 100px;
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