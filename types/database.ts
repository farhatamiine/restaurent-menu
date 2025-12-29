import { Tables } from './database.types';

export type Shop = Tables<'shops'>;
export type Category = Tables<'categories'>;
export type MenuItem = Tables<'menu_items'>;
export type MenuData = Category & {
    items: MenuItem[];
};

export interface ThemeConfig {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    borderRadius: string;
    icon?: string;
}
