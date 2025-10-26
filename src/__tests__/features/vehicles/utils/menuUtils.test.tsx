import { describe, it, expect } from '@jest/globals';
import { createMenuItems } from '../../../../features/vehicles/utils/menuUtils';

describe('menuUtils', () => {
  describe('createMenuItems', () => {
    it('should create menu items with edit, sell, and delete actions', () => {
      const onEdit = jest.fn();
      const onSell = jest.fn();
      const onDelete = jest.fn();

      const items = createMenuItems(onEdit, onSell, onDelete);

      expect(items).toBeDefined();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(4); // 3 items + 1 divider

      const editItem = items[0] as any;
      const sellItem = items[1] as any;
      const deleteItem = items[3] as any; // index 2 is divider

      expect(editItem.key).toBe('edit');
      expect(editItem.label).toBe('Editar dados');

      expect(sellItem.key).toBe('sell');
      expect(sellItem.label).toBe('Marcar como vendido');

      expect(deleteItem.key).toBe('delete');
      expect(deleteItem.label).toBe('Excluir');
      expect(deleteItem.danger).toBe(true);
    });

    it('should have divider at index 2', () => {
      const items = createMenuItems(jest.fn(), jest.fn(), jest.fn());
      const dividerItem = items[2] as any;

      expect(dividerItem.type).toBe('divider');
    });

    it('should call callbacks when items are clicked', () => {
      const onEdit = jest.fn();
      const onSell = jest.fn();
      const onDelete = jest.fn();

      const items = createMenuItems(onEdit, onSell, onDelete);

      const editItem = items[0] as any;
      const sellItem = items[1] as any;
      const deleteItem = items[3] as any;

      editItem.onClick();
      expect(onEdit).toHaveBeenCalledTimes(1);

      sellItem.onClick();
      expect(onSell).toHaveBeenCalledTimes(1);

      deleteItem.onClick();
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });
});

