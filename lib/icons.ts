import { Beer, Coffee, Croissant, IceCream, Pizza, Sandwich, Soup, Utensils, Wine } from 'lucide-react';

export const ICONS = {
    Utensils,
    Coffee,
    Pizza,
    Beer,
    Wine,
    IceCream,
    Sandwich,
    Soup,
    Croissant,
} as const;

export type IconName = keyof typeof ICONS;
