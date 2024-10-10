import { UAParser } from 'ua-parser-js';

let userAgent;
let isMobile = false;

// Check if the code is running in a browser environment
if (typeof window !== "undefined") {
  const parser = new UAParser(window.navigator.userAgent);
  userAgent = parser.getResult();

  const { type } = parser.getDevice();
  isMobile = type === "mobile" || type === "tablet";
}

export { userAgent, isMobile };
