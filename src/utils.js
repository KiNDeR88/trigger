// utils.js
export const snapToGrid = (x, y, gridSize = 20) => ({
  x: Math.round(x / gridSize) * gridSize,
  y: Math.round(y / gridSize) * gridSize,
});

export const computeAbsolutePosition = (block, blocks) => {
  if (block.groupId) {
    const parent = blocks.find(b => b.id === block.groupId);
    if (parent) {
      return {
        x: parent.position.x + block.position.x,
        y: parent.position.y + block.position.y,
      };
    }
  }
  return block.position;
};

export const generateId = () => Date.now() + Math.floor(Math.random() * 1000);