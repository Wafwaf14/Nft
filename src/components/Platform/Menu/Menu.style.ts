import styled from "styled-components";

export const MenuElement = styled.div`
  grid-area: nav;
  background: #15132b;
  padding: 4px 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 3px 3px 16px 7px rgba(0, 0, 0, 0.3);
  gap: 16px;
  align-items: center;
`;

export const SubMenu = styled.button`
  display: flex;
  gap: 30px;
  padding: 4px 8px;
  background: transparent;
  border: 0px;
  cursor: pointer;
  align-items: center;
  :disabled {
    cursor: not-allowed;
    pointer-events: all !important;
  }
  width: 100%;
`;

export const IconWrapper = styled.div`
  height: 16px;
  width: 16px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;
