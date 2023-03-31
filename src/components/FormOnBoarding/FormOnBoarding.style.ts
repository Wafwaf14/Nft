import { animated } from "@react-spring/web";
import styled from "styled-components";

export const ContainerForm = styled.div`
  display: grid;
  justify-content: flex-start;
  align-items: center;
  height: 450px;
  width: 600px;
  border-radius: 32px;
  grid-template-areas:
    "head"
    "main"
    "footer";

  grid-template-rows: 40px 1fr 40px;
  grid-template-columns: 1fr;
`;

export const HeaderForm = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  grid-area: head;
  height: 100%;
  width: 100%;
`;

export const FooterForm = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  grid-area: footer;
  height: 100%;
  width: 100%;
  padding: 0px 16px;
`;

export const ContentMainForm = styled.div`
  display: flex;
  grid-area: main;
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

export const ContainerScreen = styled(animated.div)`
  min-width: 100%;
  height: calc(100% - 48px);
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
  gap: 24px;

  padding: 24px 0px;
`;

export const FormInput = styled.input`
  border: 1px solid #424242;
  outline: 0px;

  background-color: #1c1a33;
  border-radius: 12px;
  padding: 8px 12px;
  width: 300px;
`;

export const LabelInput = styled.p`
  margin: 0px;
  font-size: 16px;
  color: #ffffff;
  font-weight: bold;
`;

export const ContainerInput = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0px 16px;
`;

export const ContainerClickedDiv = styled(animated.div)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
  width: 160px;
  border: 1px solid #15132b;
  border-radius: 16px;
  text-align: center;
  font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
  background-color: #15132b;
  //box-shadow: 5px 5px 15px 5px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  &:active {
    transform: scale(0.92);
  }
`;

export const ContainerClickGlowDiv = styled.button`
  width: 220px;
  height: 50px;
  border: none;
  outline: none;
  color: #fff;
  cursor: pointer;
  position: relative;
  z-index: 0;
  background: #707070;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  opacity: 1;

  &:before {
    content: "";
    position: absolute;
    top: -2px;
    left: -2px;
    background-size: 400%;
    z-index: -1;
    filter: blur(5px);
    width: calc(100% + 4px);
    height: calc(100% + 4px);
    animation: glowing 20s linear infinite;
    opacity: 1;
    transition: opacity 0.3s ease-in-out;
    border-radius: 5px;
  }

  &:active {
    color: white;
  }

  &:hover {
    color: white;
  }

  &:active:after {
    background: transparent;
  }

  &:hover:before {
    opacity: 1;
    color: #000;
  }

  &:hover:after {
    opacity: 1;
    color: #000;
    background: transparent;
  }

  &:after {
    z-index: -1;
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    background: #730484;
    left: 0;
    top: 0;
    border-radius: 5px;
  }
`;
