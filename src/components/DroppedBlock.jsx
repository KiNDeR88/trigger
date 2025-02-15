// DroppedBlock.jsx
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { computeAbsolutePosition } from '../utils';
import { emojiMapping } from '../constants';

const DroppedBlock = ({ block, blocks, onSelectBlock, onAddNext, onDeleteBlock, updateBlockPosition, isSelected }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'block',
    item: block,
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  });

  const commonStyle = {
    opacity: isDragging ? 0.5 : 1,
    transition: 'all 0.2s',
  };

  const style = block.groupId
    ? { ...commonStyle, marginLeft: block.position.x, marginTop: block.position.y, position: 'relative' }
    : { ...commonStyle, left: computeAbsolutePosition(block, blocks).x, top: computeAbsolutePosition(block, blocks).y, position: 'absolute' };

  const content = (
    <div
      ref={drag}
      id={`block-${block.id}`}
      className={`dropped-block ${isSelected ? 'selected' : ''}`}
      style={style}
      title={`Блок: ${block.label}`}
      onClick={(e) => { e.stopPropagation(); onSelectBlock(block); }}
    >
      <span className="block-icon">{emojiMapping[block.type] || '🔸'}</span>
      <span className="block-label">{block.label}</span>
      <button className="delete-button" title="Удалить блок" onClick={(e) => { e.stopPropagation(); onDeleteBlock(block.id); }}>
        &times;
      </button>
      <button className="add-next-button" title="Добавить следующий блок" onClick={(e) => { e.stopPropagation(); onAddNext(block); }}>
        +
      </button>
    </div>
  );

  if (block.type === 'group') {
    const groupChildrenRef = useRef(null);
    const [, dropGroup] = useDrop({
      accept: 'block',
      drop: (item, monitor) => {
        if (item.groupId === block.id) {
          const clientOffset = monitor.getClientOffset();
          const groupRect = groupChildrenRef.current.getBoundingClientRect();
          const newRelPos = { x: clientOffset.x - groupRect.left, y: clientOffset.y - groupRect.top };
          updateBlockPosition(item.id, newRelPos);
        }
      },
    });

    return (
      <div
        ref={drag}
        id={`block-${block.id}`}
        className={`dropped-block group-block ${isSelected ? 'selected' : ''}`}
        style={style}
        title={`Группа: ${block.label}`}
        onClick={(e) => { e.stopPropagation(); onSelectBlock(block); }}
      >
        <div className="group-header">{block.label}</div>
        <div ref={dropGroup} className="group-children">
          <div className="group-triggers-header">Триггеры:</div>
          <div className="group-triggers">
            {blocks.filter(child => child.groupId === block.id).map(child => (
              <DroppedBlock
                key={child.id}
                block={child}
                blocks={blocks}
                onSelectBlock={onSelectBlock}
                onAddNext={onAddNext}
                onDeleteBlock={onDeleteBlock}
                updateBlockPosition={updateBlockPosition}
                isSelected={child.isSelected}
              />
            ))}
          </div>
          {blocks.filter(child => child.groupId === block.id).length === 0 && (
            <div className="group-placeholder" onClick={(e) => { e.stopPropagation(); onAddNext(block); }} title="Нажмите, чтобы добавить триггер">
              + Добавьте триггер
            </div>
          )}
        </div>
        {blocks.filter(child => child.groupId === block.id).length > 0 && (
          <button className="add-next-button" title="Добавить блок в группу" onClick={(e) => { e.stopPropagation(); onAddNext(block); }}>
            +
          </button>
        )}
      </div>
    );
  }

  return content;
};

export default DroppedBlock;