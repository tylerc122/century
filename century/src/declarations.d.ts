// Allow importing image files
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.gif';

// Allow importing CSS files
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Define Tauri module if needed
declare namespace Tauri {
  interface Window {}
}

