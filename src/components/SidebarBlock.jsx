// SidebarBlock.jsx
import React from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes, emojiMapping } from '../constants';

const SidebarBlock = ({ type, label }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.BLOCK,
    item: { type, label, fromSidebar: true },
    collect: monitor => ({ isDragging: monitor.getItem() ? monitor.isDragging() : false }),
  });
  return (
    <div ref={drag} className="sidebar-block" style={{ opacity: isDragging ? 0.5 : 1 }} title={`Перетащите блок "${label}"`}>
      <span className="block-icon">{emojiMapping[type] || "🔸"}</span>
      <span className="block-label">{label}</span>
    </div>
  );
};

export default SidebarBlock;