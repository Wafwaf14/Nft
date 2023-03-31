import styled from "styled-components";

export const ContainerCollectionPage = styled.div`
::-webkit-scrollbar {
  width: 10px;
  
}

/* Track */
::-webkit-scrollbar-track {
  background:  #0d0b21;
  margin-right: 2px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: linear-gradient( #a8c0ff, #3f2b96);
  border-radius: 8px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #3f2b96;
}
`

export const ComponentSoldOut = styled.div`
  background: rgb(240, 80, 83);


`