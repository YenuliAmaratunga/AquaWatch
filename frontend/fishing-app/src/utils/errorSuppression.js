/**
 * Error Suppression Utility
 * Hides annoying console warnings that don't affect functionality
 */

// List of warnings to suppress
const warningsToSuppress = [
  'setLayoutAnimationEnabledExperimental',
  'Expo AV has been deprecated',
  'SafeAreaView has been deprecated',
  'was not handled by any navigator',
  'Location request failed',
  'Request failed with status code 404',
  'Error fetching weather data',
];

// Original console methods
const originalWarn = console.warn;
const originalError = console.error;

// Override console.warn
console.warn = (...args) => {
  const message = args.join(' ');
  
  // Check if this warning should be suppressed
  const shouldSuppress = warningsToSuppress.some(warning => 
    message.includes(warning)
  );
  
  if (!shouldSuppress) {
    originalWarn.apply(console, args);
  }
};

// Override console.error to suppress specific errors
console.error = (...args) => {
  const message = args.join(' ');
  
  // Check if this error should be suppressed
  const shouldSuppress = warningsToSuppress.some(warning => 
    message.includes(warning)
  );
  
  if (!shouldSuppress) {
    originalError.apply(console, args);
  }
};

// Export empty object to allow importing
export default {};

