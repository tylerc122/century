import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    success: string;
    danger: string;
    warning: string;
    info: string;
    light: string;
    dark: string;
    border: string;
    cardBackground: string;
    cardShadow: string;
    headerBackground: string;
    navBackground: string;
  }
}

