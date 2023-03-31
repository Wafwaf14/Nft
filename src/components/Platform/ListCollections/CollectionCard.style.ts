import styled from "styled-components";

export const CollectionCardElement = styled.div`
  // width: 250px;
  // max-width: 300px;
  // margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #15132b;
  border-radius: 16px;
  overflow: hidden;
`;

export const CollectionTextContent = styled.div`
  width: 100%;
  height: 150px;
  padding: 20px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  gap: 12px;
`;

export const ContainerFooterCard = styled.div`
  display: flex;
  gap: 8px;
  padding: 0px 16px;
  width: 100%;
`;

export const MintButton = styled.button`
  background-color: #672185;
  width: 100%;
  border: 0px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
`;

export const RemindMeButton = styled.button`
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #ffffff;
  font-weight: bold;
  border: 1px solid #fff;
`;

export const FlipButton = styled.button`
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #ffffff;
  font-weight: bold;
  border: 1px solid #ffffff;
`;
