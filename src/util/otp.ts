export const generateOTP = () => {
  return Math.random().toString(10).slice(-6);
};
