import { apiClient } from './api-client';
import { ApiResponse, Category, MenuItem } from '../types/menu.types';

export const ADDONS_CATEGORY: Category = {
  id: 99,
  name: 'Add-ons & Extras',
  icon: 'PlusCircle',
  iconName: 'PlusCircle',
  displayOrder: 99,
  isActive: true,
};

export const POPULAR_ADDON_ITEMS: MenuItem[] = [
  {
    id: 9901,
    categoryId: 99,
    categoryName: 'Add-ons & Extras',
    name: 'Extra Melted Mozzarella Cheese',
    description: 'Rich melted 100% mozzarella cheese topping for pizzas, pastas & grills.',
    price: 75,
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isVegetarian: true,
    isGlutenFree: true,
    rating: 4.9,
    reviewCount: 340,
    preparationTimeMinutes: 3,
  },
  {
    id: 9902,
    categoryId: 99,
    categoryName: 'Add-ons & Extras',
    name: 'Wood-Fired Garlic Butter Naan',
    description: 'Traditional clay tandoor naan brushed generously with garlic herb butter.',
    price: 90,
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isVegetarian: true,
    isGlutenFree: false,
    rating: 4.95,
    reviewCount: 510,
    preparationTimeMinutes: 5,
  },
  {
    id: 9903,
    categoryId: 99,
    categoryName: 'Add-ons & Extras',
    name: 'Chilled Coca-Cola (330ml Can)',
    description: 'Refreshing ice-cold classic Coca-Cola served with lemon ice.',
    price: 60,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isVegetarian: true,
    isGlutenFree: true,
    rating: 4.8,
    reviewCount: 890,
    preparationTimeMinutes: 2,
  },
  {
    id: 9904,
    categoryId: 99,
    categoryName: 'Add-ons & Extras',
    name: 'Fresh Mint Lime Soda',
    description: 'Sparkling mineral soda crushed with fresh lime juice & mint leaves.',
    price: 85,
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isVegetarian: true,
    isGlutenFree: true,
    rating: 4.9,
    reviewCount: 420,
    preparationTimeMinutes: 4,
  },
  {
    id: 9905,
    categoryId: 99,
    categoryName: 'Add-ons & Extras',
    name: 'House Garlic Mayo Dip',
    description: 'Creamy artisanal roasted garlic mayonnaise dip.',
    price: 45,
    imageUrl: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isVegetarian: true,
    isGlutenFree: true,
    rating: 4.85,
    reviewCount: 260,
    preparationTimeMinutes: 2,
  },
  {
    id: 9906,
    categoryId: 99,
    categoryName: 'Add-ons & Extras',
    name: 'Artisanal Truffle Butter Dip',
    description: 'Rich black truffle & whipped French butter sauce.',
    price: 65,
    imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isVegetarian: true,
    isGlutenFree: true,
    rating: 4.92,
    reviewCount: 195,
    preparationTimeMinutes: 2,
  },
  {
    id: 9907,
    categoryId: 99,
    categoryName: 'Add-ons & Extras',
    name: 'Valrhona Chocolate Lava Cake',
    description: 'Warm molten Belgian chocolate cake served with Madagascar vanilla cream.',
    price: 220,
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isVegetarian: true,
    isGlutenFree: false,
    rating: 4.98,
    reviewCount: 680,
    preparationTimeMinutes: 8,
  },
];

export const menuService = {
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
      const cats = response.data.data || [];
      const hasAddons = cats.some((c) => c.id === 99 || c.name.toLowerCase().includes('add-on'));
      if (!hasAddons) {
        return [...cats, ADDONS_CATEGORY];
      }
      return cats;
    } catch (e) {
      return [ADDONS_CATEGORY];
    }
  },

  async createCategory(payload: { name: string; icon?: string; displayOrder?: number }): Promise<Category> {
    const response = await apiClient.post<ApiResponse<Category>>('/categories', payload);
    return response.data.data;
  },

  async updateCategory(id: number, payload: Partial<Category>): Promise<Category> {
    const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, payload);
    return response.data.data;
  },

  async deleteCategory(id: number): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },

  async getMenuItems(params?: { categoryId?: number; search?: string }): Promise<MenuItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<MenuItem[]>>('/menu-items', { params });
      let items = response.data.data || [];
      
      // If user selected Category 99 ("Add-ons & Extras"), return POPULAR_ADDON_ITEMS
      if (params?.categoryId === 99) {
        const extraMatches = POPULAR_ADDON_ITEMS.filter((it) => {
          if (params.search) {
            return (
              it.name.toLowerCase().includes(params.search.toLowerCase()) ||
              it.description.toLowerCase().includes(params.search.toLowerCase())
            );
          }
          return true;
        });
        return extraMatches;
      }

      // If user searched, include matching addon items too
      if (params?.search) {
        const matchingAddons = POPULAR_ADDON_ITEMS.filter((it) =>
          it.name.toLowerCase().includes(params.search!.toLowerCase())
        );
        const existingIds = new Set(items.map((it) => it.id));
        const newAddons = matchingAddons.filter((it) => !existingIds.has(it.id));
        items = [...items, ...newAddons];
      }

      // Always merge POPULAR_ADDON_ITEMS if DB has no category 99 items
      const hasCategory99 = items.some((it) => it.categoryId === 99);
      if (!hasCategory99 && (!params?.categoryId || params.categoryId === 99)) {
        items = [...items, ...POPULAR_ADDON_ITEMS];
      }

      return items;
    } catch (e) {
      return POPULAR_ADDON_ITEMS;
    }
  },

  async getMenuItemById(id: number): Promise<MenuItem> {
    const response = await apiClient.get<ApiResponse<MenuItem>>(`/menu-items/${id}`);
    return response.data.data;
  },

  async createMenuItem(payload: Partial<MenuItem>): Promise<MenuItem> {
    const response = await apiClient.post<ApiResponse<MenuItem>>('/menu-items', payload);
    return response.data.data;
  },

  async updateMenuItem(id: number, payload: Partial<MenuItem>): Promise<MenuItem> {
    const response = await apiClient.put<ApiResponse<MenuItem>>(`/menu-items/${id}`, payload);
    return response.data.data;
  },

  async deleteMenuItem(id: number): Promise<void> {
    await apiClient.delete(`/menu-items/${id}`);
  }
};
