// Sidebar.jsx
import React from 'react';
import SidebarBlock from './SidebarBlock';

const Sidebar = ({ leftMenu, onTemplateClick }) => (
  <div className="left-menu">
    <input className="menu-search" type="text" placeholder="Поиск блоков..." title="Введите текст для поиска" />
    {Object.keys(leftMenu).map(categoryKey => (
      <div key={categoryKey}>
        <h3 className="category-title">
          {categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)}
        </h3>
        {leftMenu[categoryKey].map((group, idx) => (
          <div key={idx} className="menu-group">
            <div className="menu-group-header" title="Нажмите, чтобы свернуть/развернуть группу">
              <span className="menu-group-title">{group.groupTitle}</span>
            </div>
            <div className="menu-group-items">
              {group.items.map((item, index) =>
                item.type === "template" ? (
                  <div key={`${categoryKey}-${idx}-${index}`} onClick={() => onTemplateClick(item)} title={`Добавить шаблон "${item.label}"`}>
                    {item.label}
                  </div>
                ) : (
                  <SidebarBlock key={`${categoryKey}-${idx}-${index}`} type={item.type} label={item.label} />
                )
              )}
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
);

export default Sidebar;