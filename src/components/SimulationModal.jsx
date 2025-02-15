// SimulationModal.jsx
import React from 'react';
import Modal from './Modal';

const SimulationModal = ({ simulationResult, onClose }) => (
  <Modal onClose={onClose}>
    <div className="simulation-modal">
      <h3 className="modal-title">Симуляция цепочки</h3>
      <pre className="simulation-result" style={{ whiteSpace: 'pre-wrap', maxHeight: '400px', overflowY: 'auto' }}>
        {simulationResult}
      </pre>
      <div className="modal-buttons">
        <button className="cancel-button" onClick={onClose} title="Закрыть">Закрыть</button>
      </div>
    </div>
  </Modal>
);

export default SimulationModal;