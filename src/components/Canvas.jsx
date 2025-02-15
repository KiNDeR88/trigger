// Canvas.jsx
import React, { useEffect } from 'react';
import { useDrop } from 'react-dnd';
import DroppedBlock from './DroppedBlock';
import Xarrow from 'react-xarrows';
import { computeAbsolutePosition } from '../utils';
import { TRIGGER_TYPES } from '../constants';

const Canvas = ({ blocks, addBlock, updateBlockPosition, onSelectBlock, onAddNext, onDeleteBlock }) => {
  const [, drop] = useDrop({
    accept: 'block',
    drop: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      const canvasRect = document.getElementById('canvas').getBoundingClientRect();
      const dropPosition = { x: clientOffset.x - canvasRect.left, y: clientOffset.y - canvasRect.top };

      // Если блок из левого меню является триггером – логика создания группы может быть доработана
      if (item.fromSidebar && TRIGGER_TYPES.includes(item.type)) {
        // Здесь можно добавить вызов getOrCreateGroupForTrigger
        return;
      }

      if (!item.id) {
        const newBlock = {
          ...item,
          position: dropPosition,
          id: Date.now() + Math.floor(Math.random() * 1000),
          next: '',
        };
        addBlock(newBlock);
      } else {
        if (item.groupId) {
          const parent = blocks.find(b => b.id === item.groupId);
          if (parent) {
            const relativePos = { x: dropPosition.x - parent.position.x, y: dropPosition.y - parent.position.y };
            updateBlockPosition(item.id, relativePos);
          }
        } else {
          updateBlockPosition(item.id, dropPosition);
        }
      }
    },
  });

  const absPositions = blocks.map(b => computeAbsolutePosition(b, blocks));
  const maxX = absPositions.length ? Math.max(...absPositions.map(p => p.x), 800) : 800;
  const maxY = absPositions.length ? Math.max(...absPositions.map(p => p.y), 600) : 600;
  const canvasStyle = { width: maxX + 300, height: maxY + 200 };

  useEffect(() => { window.dispatchEvent(new Event('resize')); }, [blocks]);

  const topLevelBlocks = blocks.filter(b => !b.groupId);

  return (
    <div id="canvas" ref={drop} className="canvas" style={canvasStyle} title="Зона холста">
      {topLevelBlocks.map(block => (
        <DroppedBlock
          key={block.id}
          block={block}
          blocks={blocks}
          onSelectBlock={onSelectBlock}
          onAddNext={onAddNext}
          onDeleteBlock={onDeleteBlock}
          updateBlockPosition={updateBlockPosition}
        />
      ))}
      {blocks.map(block => {
        if (block.type === 'route') {
          return (
            <React.Fragment key={`xarrow-${block.id}`}>
              {block.nextTrue && blocks.find(b => b.id === block.nextTrue) && (
                <Xarrow key={`xarrow-${block.id}-true`} start={`block-${block.id}`} end={`block-${block.nextTrue}`} color="green" strokeWidth={2} animateDrawing={false} />
              )}
              {block.nextFalse && blocks.find(b => b.id === block.nextFalse) && (
                <Xarrow key={`xarrow-${block.id}-false`} start={`block-${block.id}`} end={`block-${block.nextFalse}`} color="red" strokeWidth={2} animateDrawing={false} />
              )}
            </React.Fragment>
          );
        } else if (block.next && blocks.find(b => b.id === block.next)) {
          return (
            <Xarrow key={`xarrow-${block.id}`} start={`block-${block.id}`} end={`block-${block.next}`} color="#1e88e5" strokeWidth={2} animateDrawing={false} />
          );
        }
        return null;
      })}
    </div>
  );
};

export default Canvas;