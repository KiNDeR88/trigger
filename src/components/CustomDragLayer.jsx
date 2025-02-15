// CustomDragLayer.jsx
import React from 'react';
import { useDragLayer } from 'react-dnd';
import { emojiMapping } from '../constants';

const CustomDragLayer = () => {
  const { item, isDragging, currentOffset } = useDragLayer(monitor => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getClientOffset(),
  }));
  if (!isDragging || !currentOffset || !item) return null;
  const layerStyle = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 100,
    left: 0,
    top: 0,
    transform: `translate(${currentOffset.x - 20}px, ${currentOffset.y - 20}px)`
  };
  const circleStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    border: '2px solid #1e88e5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px'
  };
  return (
    <div style={layerStyle}>
      <div style={circleStyle}>
        {emojiMapping[item.type] || '🔸'}
      </div>
    </div>
  );
};

export default CustomDragLayer;