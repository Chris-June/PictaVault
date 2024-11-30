// Environment variable management
export const getEnvironmentVariable = (key) => {
  const value = import.meta.env[key];
  if (!value) {
    console.warn(`Environment variable ${key} not found`);
  }
  return value;
};
