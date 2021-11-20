/*
Algorithms
*/

const g4 = () => {
  return (((1 + Math.random()) * 0x10000) | 0)
   .toString(16)
   .substring(1);
};

module.exports = {
  generateId: () => (
    `${g4()}${g4()}-${g4()}-${g4()}-${g4()}-${g4()}${g4()}${g4()}`
  )
};
