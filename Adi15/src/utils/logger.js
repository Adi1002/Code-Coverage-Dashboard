export const logger = {
  error: (message, errorObj = null, componentName = 'Unknown') => {
    // 1. Format the error for the console (Development)
    console.error(`[🚨 ERROR in ${componentName}]: ${message}`, errorObj);

    // 2. Here is where you will eventually send the error to the backend!
    // Example for the future:
    // fetch('/api/logs', { 
    //   method: 'POST', 
    //   body: JSON.stringify({ message, error: errorObj?.toString(), component: componentName }) 
    // });
  },
  
  warn: (message, data = null) => {
    console.warn(`[⚠️ WARN]: ${message}`, data);
  },
  
  info: (message, data = null) => {
    console.info(`[ℹ️ INFO]: ${message}`, data);
  }
};