// NextBlockModal.jsx
import React from 'react';
import Modal from './Modal';
import { TRIGGER_TYPES, ACTION_TYPES, CONDITION_TYPES, emojiMapping } from '../constants';

const NextBlockModal = ({ parentBlock, options, onSelect, onCancel }) => {
  const modalTitle = parentBlock.type === 'group'
    ? `Выберите триггер для группы "${parentBlock.label}"`
    : `Выберите следующий блок для "${parentBlock.label}"`;

  const groupedOptions = {
    "Триггеры": options.filter(opt => TRIGGER_TYPES.includes(opt.type)),
    "Действия": options.filter(opt => ACTION_TYPES.includes(opt.type)),
    "Условия": options.filter(opt => CONDITION_TYPES.includes(opt.type))
  };

  return (
    <Modal onClose={onCancel}>
      <div className="next-block-modal">
        <h3 className="modal-title">{modalTitle}</h3>
        {Object.entries(groupedOptions).map(([groupName, opts]) =>
          opts.length ? (
            <div key={groupName} className="option-group">
              <h4 className="group-title">{groupName}</h4>
              <div className="option-grid">
                {opts.map(option => (
                  <div key={option.type + option.label} className="option-card" onClick={() => onSelect(option)} title={`Добавить блок "${option.label}"`}>
                    <span className="option-icon">{emojiMapping[option.type] || "🔸"}</span>
                    <span className="option-label">{option.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null
        )}
        <div className="modal-buttons">
          <button className="cancel-button" onClick={onCancel} title="Отмена">Отмена</button>
        </div>
      </div>
    </Modal>
  );
};

export default NextBlockModal;