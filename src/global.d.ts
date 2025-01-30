declare global {
    interface Window {
      api: {
        getMusic: (args: string) => Promise<string[]>;
        playMusic: (args: string) => Promise<void>;
        // Add other methods as needed
      };
    }
  }
  
  export {}; // This file needs to be a module