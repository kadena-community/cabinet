// styled.d.ts
import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    primary1: string;
    bg1: string;
    bg2: string; // add other theme variables as needed
  }
}
