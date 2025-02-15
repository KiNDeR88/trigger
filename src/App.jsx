// App.jsx
import React, { useState, useReducer, useEffect, useCallback, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import NextBlockModal from './components/NextBlockModal';
import EditModal from './components/EditModal';
import SimulationModal from './components/SimulationModal';
import CustomDragLayer from './components/CustomDragLayer';
import { snapToGrid, generateId } from './utils';
import { TRIGGER_TYPES, ACTION_TYPES, CONDITION_TYPES } from './constants';

// Пример данных для левого меню (можно расширить)
const leftMenuData = {
  triggers: [
    {
      groupTitle: 'Базовые триггеры',
      items: [
        { type: "subscription", label: "Подписка" },
        { type: "confirmation", label: "Подтверждение" },
        { type: "welcome", label: "Приветствие" },
        { type: "order", label: "Оформление заказа" },
        { type: "abandoned-cart", label: "Брошенная корзина" },
        { type: "review-request", label: "Запрос отзыва" },
        { type: "vip-customer", label: "VIP клиент" },
        { type: "new-registration", label: "Новая регистрация" },
        { type: "loyalty", label: "Лояльный клиент" },
      ],
    },
    {
      groupTitle: 'Дополнительные триггеры',
      items: [
        { type: "birthday", label: "День рождения" },
        { type: "anniversary", label: "Годовщина" },
      ],
    },
    {
      groupTitle: "Группы цепочек",
      items: [
        { type: "group", label: "Новая группа" }
      ],
    }
  ]
};

const allOptions = [
  ...[
    { type: "subscription", label: "Подписка" },
    { type: "confirmation", label: "Подтверждение" },
    { type: "welcome", label: "Приветствие" },
    { type: "order", label: "Оформление заказа" },
    { type: "abandoned-cart", label: "Брошенная корзина" },
    { type: "review-request", label: "Запрос отзыва" },
    { type: "birthday", label: "День рождения" },
    { type: "anniversary", label: "Годовщина" },
    { type: "vip-customer", label: "VIP клиент" },
    { type: "new-registration", label: "Новая регистрация" },
    { type: "loyalty", label: "Лояльный клиент" },
  ],
  ...[
    { type: "send-email", label: "Отправить Email" },
    { type: "apply-discount", label: "Применить скидку" },
    { type: "bonus-action", label: "Начислить бонусы" },
    { type: "send-sms", label: "Отправить SMS" },
    { type: "send-push", label: "Push-уведомление" },
    { type: "send-whatsapp", label: "WhatsApp сообщение" },
    { type: "apply-free-shipping", label: "Бесплатная доставка" },
    { type: "assign-coupon", label: "Выдать купон" },
    { type: "update-loyalty-points", label: "Обновить бонусы" },
    { type: "add-loyalty-points", label: "Начислить бонусы" },
    { type: "redeem-loyalty-points", label: "Списать бонусы" },
    { type: "apply-loyalty-discount", label: "Лояльная скидка" },
  ],
  ...[
    { type: "if-no-order", label: "Если нет заказа" },
    { type: "if-abandoned-cart", label: "Брошенная корзина" },
    { type: "route", label: "Маршрут (If/Else)" },
    { type: "if-age-greater", label: "Если возраст больше" },
    { type: "if-age-less", label: "Если возраст меньше" },
    { type: "if-location", label: "По региону" },
    { type: "if-purchase-frequency", label: "Частота покупок" },
    { type: "if-cart-value-exceeds", label: "Сумма корзины" },
    { type: "if-time-of-day", label: "Время суток" },
    { type: "if-visit-duration", label: "Длительность сессии" },
    { type: "if-webhook-response", label: "Ответ вебхука" },
    { type: "if-inventory-low", label: "Низкий запас" },
    { type: "if-loyalty-points-exceed", label: "Если бонусы больше" },
    { type: "if-customer-tier", label: "Уровень клиента" },
  ]
];

const initialStateBlocks = {
  blocks: [],
  history: [[]],
  historyIndex: 0,
};

const pushHistory = (state, newBlocks) => {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(newBlocks);
  return {
    ...state,
    blocks: newBlocks,
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
};

const blocksReducer = (state, action) => {
  switch (action.type) {
    case "ADD_BLOCK": {
      const block = action.payload;
      const snappedPosition = snapToGrid(block.position.x, block.position.y);
      const newBlock = { ...block, position: snappedPosition };
      return pushHistory(state, [...state.blocks, newBlock]);
    }
    case "UPDATE_BLOCK_POSITION": {
      const { id, position } = action.payload;
      const updatedBlocks = state.blocks.map(block =>
        block.id === id ? { ...block, position } : block
      );
      return pushHistory(state, updatedBlocks);
    }
    case "UPDATE_BLOCK_PROPERTIES": {
      const { id, newProps } = action.payload;
      const updatedBlocks = state.blocks.map(block =>
        block.id === id ? { ...block, ...newProps } : block
      );
      return pushHistory(state, updatedBlocks);
    }
    case "DELETE_BLOCK": {
      const blockToDelete = state.blocks.find(block => block.id === action.payload);
      let updatedBlocks;
      if (blockToDelete && blockToDelete.type === "group") {
        updatedBlocks = state.blocks.filter(block => block.id !== action.payload && block.groupId !== action.payload);
      } else {
        updatedBlocks = state.blocks.filter(block => block.id !== action.payload);
      }
      const cleanedBlocks = updatedBlocks.map(b => {
        let newB = { ...b };
        if (newB.next && !updatedBlocks.some(x => x.id === newB.next)) newB.next = "";
        if (newB.type === "route") {
          if (newB.nextTrue && !updatedBlocks.some(x => x.id === newB.nextTrue)) newB.nextTrue = "";
          if (newB.nextFalse && !updatedBlocks.some(x => x.id === newB.nextFalse)) newB.nextFalse = "";
        }
        return newB;
      });
      return pushHistory(state, cleanedBlocks);
    }
    case "DUPLICATE_BLOCK": {
      const blockToDuplicate = action.payload;
      const newBlock = {
        ...blockToDuplicate,
        id: generateId(),
        position: { x: blockToDuplicate.position.x + 20, y: blockToDuplicate.position.y + 20 },
      };
      return pushHistory(state, [...state.blocks, newBlock]);
    }
    case "ADD_NEXT_BLOCK": {
      const { parentId, newBlock } = action.payload;
      const updatedBlocks = state.blocks.map(block =>
        block.id === parentId ? { ...block, next: newBlock.id } : block
      );
      return pushHistory(state, [...updatedBlocks, newBlock]);
    }
    case "UNDO": {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        return { ...state, blocks: state.history[newIndex], historyIndex: newIndex };
      }
      return state;
    }
    case "REDO": {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        return { ...state, blocks: state.history[newIndex], historyIndex: newIndex };
      }
      return state;
    }
    case "RESET":
      return { blocks: [], history: [[]], historyIndex: 0 };
    case "LOAD":
      return pushHistory(state, action.payload);
    default:
      return state;
  }
};

const getAllowedNextTypes = (prevType) => {
  if (TRIGGER_TYPES.includes(prevType)) {
    return [...TRIGGER_TYPES, ...ACTION_TYPES, ...CONDITION_TYPES];
  }
  if (ACTION_TYPES.includes(prevType)) {
    return [...CONDITION_TYPES, ...TRIGGER_TYPES];
  }
  if (CONDITION_TYPES.includes(prevType)) {
    return [...ACTION_TYPES];
  }
  if (prevType === "group") {
    return [...TRIGGER_TYPES];
  }
  return [];
};

const logDependency = (prevBlock, newBlock, extraMessage = "") => {
  console.log(
    `Добавлен блок "${newBlock.label}" (тип: ${newBlock.type}). Его выполнение зависит от блока "${prevBlock.label}" (тип: ${prevBlock.type}). ${extraMessage}`
  );
};

const App = () => {
  const [nextParent, setNextParent] = useState(null);
  const [appState, appDispatch] = useReducer(blocksReducer, initialStateBlocks);
  const { blocks, historyIndex } = appState;
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [simulationResult, setSimulationResult] = useState("");
  const [simulationModalOpen, setSimulationModalOpen] = useState(false);

  const allowedOptions = useMemo(() => {
    if (!nextParent || !nextParent.type) return [];
    const allowedTypes = getAllowedNextTypes(nextParent.type);
    return allOptions.filter(opt => allowedTypes.includes(opt.type));
  }, [nextParent]);

  const updateBlockPosition = useCallback((id, position) =>
    appDispatch({ type: "UPDATE_BLOCK_POSITION", payload: { id, position } }), []);

  const updateBlockProperties = useCallback((id, newProps) => {
    appDispatch({ type: "UPDATE_BLOCK_PROPERTIES", payload: { id, newProps } });
    setSelectedBlock(null);
  }, []);

  const deleteBlock = useCallback(id => {
    appDispatch({ type: "DELETE_BLOCK", payload: id });
    setSelectedBlock(null);
  }, []);

  const duplicateBlock = useCallback(block => {
    appDispatch({ type: "DUPLICATE_BLOCK", payload: block });
  }, []);

  const addBlock = useCallback(block => {
    appDispatch({ type: "ADD_BLOCK", payload: block });
  }, []);

  const addNextBlock = useCallback((parentId, newBlock) => {
    appDispatch({ type: "ADD_NEXT_BLOCK", payload: { parentId, newBlock } });
  }, []);

  const handleSave = useCallback(() => {
    localStorage.setItem("triggerScenario", JSON.stringify(blocks));
    alert("Сценарий сохранен!");
  }, [blocks]);

  const handleLoad = useCallback(() => {
    const loaded = localStorage.getItem("triggerScenario");
    if (loaded) {
      const loadedBlocks = JSON.parse(loaded);
      appDispatch({ type: "LOAD", payload: loadedBlocks });
    } else {
      alert("Нет сохраненного сценария.");
    }
  }, []);

  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(blocks, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "scenario.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [blocks]);

  const handleImport = useCallback((e) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      try {
        const imported = JSON.parse(fileReader.result);
        appDispatch({ type: "LOAD", payload: imported });
      } catch (err) {
        alert("Ошибка при загрузке файла");
      }
    };
    fileReader.readAsText(e.target.files[0]);
  }, []);

  const handleAddNext = useCallback(parentBlock => {
    setNextParent(parentBlock);
  }, []);

  const handleSelectNextBlock = useCallback(option => {
    const parentBlock = nextParent;
    let newBlock;
    if (parentBlock.type === "group") {
      newBlock = {
        type: option.type,
        label: option.label,
        position: { x: 20, y: blocks.filter(b => b.groupId === parentBlock.id).length * 80 },
        id: generateId(),
        groupId: parentBlock.id,
        next: "",
      };
      addBlock(newBlock);
      logDependency(parentBlock, newBlock, "Новый триггер добавлен в группу.");
    } else {
      newBlock = {
        type: option.type,
        label: option.label,
        position: { x: parentBlock.position.x + 300, y: parentBlock.position.y },
        id: generateId(),
        next: "",
      };
      if (parentBlock.groupId) newBlock.groupId = parentBlock.groupId;
      addNextBlock(parentBlock.id, newBlock);
      logDependency(parentBlock, newBlock, "Следующий блок добавлен после предыдущего.");
    }
    setNextParent(null);
  }, [nextParent, blocks, addBlock, addNextBlock]);

  const simulateChain = useCallback(() => {
    let simulationLog = "";
    const topBlocks = blocks.filter(b => !b.groupId);
    topBlocks.forEach(startBlock => {
      simulationLog += `\n=== Начало цепочки ===\n`;
      simulationLog += `Шаг 1: "${startBlock.label}" [id: ${startBlock.id}, тип: ${startBlock.type}]\n`;
      let step = 2;
      let current = startBlock;
      while (current) {
        if (current.type === "group") {
          const children = blocks.filter(b => b.groupId === current.id);
          if (children.length === 0) {
            simulationLog += `\nГруппа "${current.label}" пуста. Цепочка прервана.\n`;
            break;
          }
          simulationLog += `\n--- Группа "${current.label}" (логика: ${current.logicMode}) ---\n`;
          if (current.next) {
            const nextBlock = blocks.find(b => b.id === current.next);
            if (nextBlock) {
              simulationLog += `\nПереход к блоку: "${nextBlock.label}" [id: ${nextBlock.id}].\n`;
              current = nextBlock;
              simulationLog += `Шаг ${step}: "${current.label}" [id: ${current.id}]\n`;
              step++;
              continue;
            }
          }
          break;
        } else if (current.type === "route") {
          simulationLog += `\n--- Блок "Маршрут": "${current.label}" [id: ${current.id}]\n`;
          const branch = Math.random() > 0.5 ? "true" : "false";
          simulationLog += `   Выбранная ветка: ${branch}\n`;
          const nextId = branch === "true" ? current.nextTrue : current.nextFalse;
          if (nextId) {
            const nextBlock = blocks.find(b => b.id === nextId);
            if (nextBlock) {
              simulationLog += `   Переход к блоку: "${nextBlock.label}" [id: ${nextBlock.id}].\n`;
              current = nextBlock;
              simulationLog += `Шаг ${step}: "${current.label}" [id: ${current.id}]\n`;
              step++;
              continue;
            } else {
              simulationLog += "   Целевой блок не найден\n";
              break;
            }
          } else {
            simulationLog += "   Нет следующего блока\n";
            break;
          }
        } else {
          if (current.next) {
            const nextBlock = blocks.find(b => b.id === current.next);
            if (nextBlock) {
              simulationLog += `\nПереход от "${current.label}" к "${nextBlock.label}".\n`;
              current = nextBlock;
              simulationLog += `Шаг ${step}: "${current.label}" [id: ${current.id}]\n`;
              step++;
              continue;
            } else {
              simulationLog += "\nЦелевой блок не найден\n";
              break;
            }
          } else {
            break;
          }
        }
      }
      simulationLog += "\n=== Конец цепочки ===\n";
    });
    setSimulationResult(simulationLog);
    setSimulationModalOpen(true);
  }, [blocks]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <Header />
        <div className="main-container">
          <aside className="sidebar" title="Добавьте триггеры, группы или шаблоны">
            <h2>Триггеры и группы</h2>
            <Sidebar leftMenu={leftMenuData} onTemplateClick={() => { /* Дополнительная логика для шаблонов */ }} />
          </aside>
          <main className="canvas-container">
            <div className="toolbar">
              <button onClick={() => appDispatch({ type: "UNDO" })} disabled={historyIndex === 0} title="Отменить">Отмена</button>
              <button onClick={() => appDispatch({ type: "REDO" })} title="Повтор">Повтор</button>
              <button onClick={() => appDispatch({ type: "RESET" })} title="Сбросить">Сброс</button>
              <button onClick={handleSave} title="Сохранить сценарий">Сохранить</button>
              <button onClick={handleLoad} title="Загрузить сценарий">Загрузить</button>
              <button onClick={handleExport} title="Экспортировать сценарий">Экспорт</button>
              <input type="file" accept="application/json" onChange={handleImport} title="Импортировать сценарий" />
              <button onClick={simulateChain} title="Запустить симуляцию цепочки">Симуляция</button>
              {selectedBlock && (
                <>
                  <button onClick={() => deleteBlock(selectedBlock.id)} title="Удалить выделенный блок">Удалить</button>
                  <button onClick={() => duplicateBlock(selectedBlock)} title="Дублировать выделенный блок">Дублировать</button>
                </>
              )}
            </div>
            <Canvas
              blocks={blocks}
              addBlock={addBlock}
              updateBlockPosition={updateBlockPosition}
              onSelectBlock={setSelectedBlock}
              onAddNext={handleAddNext}
              onDeleteBlock={deleteBlock}
            />
          </main>
        </div>
        {selectedBlock && (
          <EditModal
            block={selectedBlock}
            allBlocks={blocks}
            onSave={updateBlockProperties}
            onCancel={() => setSelectedBlock(null)}
          />
        )}
        {nextParent && (
          <NextBlockModal
            parentBlock={nextParent}
            options={allowedOptions}
            onSelect={handleSelectNextBlock}
            onCancel={() => setNextParent(null)}
          />
        )}
        {simulationModalOpen && (
          <SimulationModal simulationResult={simulationResult} onClose={() => setSimulationModalOpen(false)} />
        )}
        <CustomDragLayer />
      </div>
    </DndProvider>
  );
};

export default App;