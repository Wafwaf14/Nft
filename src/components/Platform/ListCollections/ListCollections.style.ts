import styled from "styled-components";

export const ContainerContent = styled.div`
  height: 100%;
  width: 100%;
  grid-area: main;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  /* width */
  ::-webkit-scrollbar {
    width: 10px;
  }
  /* Track */
  ::-webkit-scrollbar-track {
    background: #0d0b21;
    margin-right: 2px;
  }
  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(#a8c0ff, #3f2b96);
    border-radius: 8px;
  }
  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #3f2b96;
  }
`;

export const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
`;

export const SearchContainer = styled.div`
  padding: 12px 20px;
  border: 0px;
  color: #ffffff;
  background-color: #15132b;
  height: 45px;
  width: 300px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const SearchBar = styled.input`
  padding: 0px;
  border: 0px;
  color: #aaa;
  background-color: transparent;
  border: 0px solid transparent;
  outline-offset: 0px;
  outline: none;
  font-size: 14px;
`;

export const IconWrapper = styled.div`
  height: 45px;
  width: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #15132b;
  border-radius: 8px;
`;

export const CollectionWrapper = styled.div`
  padding: 16px;
  overflow: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none;
  ::-webkit-scrollbar {
    display: none;
  }
  justify-content: center;
`;
