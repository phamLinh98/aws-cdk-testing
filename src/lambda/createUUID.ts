// Generate a random sequence of numbers
export const generateRandomSequence = (length:any) => {
      const sequence = [];
      for (let i = 0; i < length; i++) {
            sequence.push(Math.floor(Math.random() * 100)); // Random number between 0 and 99
      }
      return sequence;
};