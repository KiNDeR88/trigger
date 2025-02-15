// EditModal.jsx
import React, { useEffect } from 'react';
import Modal from './Modal';
import { useForm } from 'react-hook-form';

const EditModal = ({ block, allBlocks, onSave, onCancel }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: block });
  useEffect(() => { reset(block); }, [block, reset]);

  const onSubmit = data => {
    if (block.type === 'route') {
      data.nextTrue = data.nextTrue ? parseInt(data.nextTrue, 10) : "";
      data.nextFalse = data.nextFalse ? parseInt(data.nextFalse, 10) : "";
    } else {
      data.next = data.next ? parseInt(data.next, 10) : "";
    }
    onSave(block.id, data);
  };

  const triggerTypes = ["subscription", "confirmation", "welcome", "birthday", "anniversary", "time-sensitive", "inactivity", "exit-intent", "page-view", "click", "vip-customer", "new-registration", "loyalty"];
  const actionTypes = ["send-email", "apply-discount", "bonus-action", "send-sms", "send-push", "send-whatsapp", "apply-free-shipping", "assign-coupon", "update-loyalty-points", "add-loyalty-points", "redeem-loyalty-points", "apply-loyalty-discount"];
  const conditionTypes = ["if-no-order", "if-abandoned-cart", "route", "if-age-greater", "if-age-less", "if-location", "if-purchase-frequency", "if-cart-value-exceeds", "if-time-of-day", "if-visit-duration", "if-webhook-response", "if-inventory-low", "if-loyalty-points-exceed", "if-customer-tier"];

  return (
    <Modal onClose={onCancel}>
      <h3>{block.type === 'group' ? 'Редактирование группы' : 'Редактирование блока'}</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="edit-form">
        <label title="Введите название блока">
          Название:
          <input type="text" {...register("label", { required: "Название обязательно", minLength: { value: 3, message: "Минимум 3 символа" } })} />
          {errors.label && <span className="error-message">{errors.label.message}</span>}
        </label>
        {block.type === 'group' && (
          <label title="Выберите логическую операцию для группы">
            Логическая операция:
            <select {...register("logicMode")}>
              <option value="AND">AND (Все должны сработать)</option>
              <option value="OR">OR (Достаточно одного)</option>
            </select>
          </label>
        )}
        {block.type === 'route' ? (
          <>
            <label title="Выберите блок для истинного условия">
              Если истинно:
              <select {...register("nextTrue")}>
                <option value="">Нет</option>
                {allBlocks.filter(b => b.id !== block.id).map(b => (
                  <option key={b.id} value={b.id}>
                    {b.id} - {b.label}
                  </option>
                ))}
              </select>
            </label>
            <label title="Выберите блок для ложного условия">
              Если ложно:
              <select {...register("nextFalse")}>
                <option value="">Нет</option>
                {allBlocks.filter(b => b.id !== block.id).map(b => (
                  <option key={b.id} value={b.id}>
                    {b.id} - {b.label}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <label title="Выберите следующий блок">
            Следующий блок:
            <select {...register("next")}>
              <option value="">Нет</option>
              {allBlocks.filter(b => b.id !== block.id).map(b => (
                <option key={b.id} value={b.id}>
                  {b.id} - {b.label}
                </option>
              ))}
            </select>
          </label>
        )}
        {(triggerTypes.includes(block.type) || actionTypes.includes(block.type) || conditionTypes.includes(block.type)) && (
          <>
            <label title="Введите приоритет">
              Приоритет:
              <input type="number" {...register("priority")} />
            </label>
            <label title="Введите задержку (сек.)">
              Задержка (сек.):
              <input type="number" {...register("delay")} />
            </label>
          </>
        )}
        {triggerTypes.includes(block.type) && block.type !== 'route' && (
          <>
            <label title="Введите сегмент клиентов">
              Сегмент клиентов:
              <input type="text" {...register("customerSegment")} />
            </label>
            <label title="Введите демографические критерии">
              Демографические критерии:
              <input type="text" {...register("demographicCriteria")} />
            </label>
            <label title="Введите сценарий покупки">
              Сценарий покупки:
              <input type="text" {...register("purchaseScenario")} placeholder="first, returning" />
            </label>
            <label title="Введите категорию товара">
              Категория товара:
              <input type="text" {...register("triggerProductCategory")} placeholder="Например, электроника" />
            </label>
          </>
        )}
        {actionTypes.includes(block.type) && (
          <>
            <label title="Введите порог значения заказа">
              Порог значения заказа:
              <input type="number" {...register("orderValueThreshold")} placeholder="Введите число" />
            </label>
            <label title="Введите промокод">
              Промокод:
              <input type="text" {...register("promoCode")} />
            </label>
            <label title="Введите текст SMS">
              Текст SMS-сообщения:
              <input type="text" {...register("smsMessage")} placeholder="Например, Получите скидку 15%!" />
            </label>
          </>
        )}
        {conditionTypes.includes(block.type) && block.type !== 'route' && (
          <>
            <label title="Введите условие">
              Условие:
              <input type="text" {...register("customCondition")} placeholder="Например, orderValue > 1000" />
            </label>
          </>
        )}
        <div className="modal-buttons">
          <button type="submit" title="Сохранить изменения">Сохранить</button>
          <button type="button" onClick={onCancel} title="Отмена">Отмена</button>
        </div>
      </form>
    </Modal>
  );
};

export default EditModal;