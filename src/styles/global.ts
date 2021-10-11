import { createGlobalStyle } from "styled-components";
import "react-toastify/dist/ReactToastify.css";

import background from "../assets/images/background.svg";

export default createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    outline: 0;
    box-sizing: border-box;
  }

  body {
    background: #191920 url(${background}) no-repeat center top;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  body, input, button {
    font: 14px Roboto, sans-serif;
  }

  #root {
    max-width: 1020px;
    margin: 0 auto;
    padding: 0 20px 50px;
  }

  button {
    cursor: pointer;
  }

  ::-webkit-scrollbar{
   background-color : #999;
   height: 0.3rem;
   width: 0.3rem;
  }
  ::-webkit-scrollbar-thumb{
   background-color : #7159c1 ;
  }
`;
