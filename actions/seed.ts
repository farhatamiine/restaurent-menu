'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

const DEMO_CATEGORIES = [
    {
        name: 'Starters',
        icon: 'Salad',
        items: [
            { name: 'Caesar Salad', description: 'Romaine lettuce, croutons, parmesan cheese, and caesar dressing.', price: 12.5, icon: 'Salad' },
            { name: 'Truffle Fries', description: 'Crispy fries with truffle oil and parmesan.', price: 9.0, icon: 'Pizza' }, // Pizza as generic food fallback if Fries missing
            { name: 'Tomato Soup', description: 'Creamy tomato soup with basil.', price: 8.5, icon: 'Soup' },
        ],
    },
    {
        name: 'Mains',
        icon: 'Utensils',
        items: [
            { name: 'Grilled Salmon', description: 'Fresh atlantic salmon with roasted vegetables.', price: 24.0, icon: 'Fish' },
            { name: 'Cheeseburger', description: 'Angus beef patty, cheddar, lettuce, tomato, house sauce.', price: 16.5, icon: 'Sandwich' },
            { name: 'Margherita Pizza', description: 'Tomato sauce, mozzarella, and fresh basil.', price: 15.0, icon: 'Pizza' },
            { name: 'Steak Frites', description: 'Ribeye steak with herb butter and fries.', price: 29.0, icon: 'Beef' },
        ],
    },
    {
        name: 'Desserts',
        icon: 'Croissant', // Using Croissant as bakery/dessert fallback
        items: [
            { name: 'Chocolate Cake', description: 'Rich chocolate layer cake.', price: 9.0, icon: 'Cake' },
            { name: 'Ice Cream', description: 'Three scoops of vanilla bean ice cream.', price: 6.5, icon: 'IceCream' },
            { name: 'Tiramisu', description: 'Classic italian coffee-flavored dessert.', price: 10.0, icon: 'Coffee' },
        ],
    },
    {
        name: 'Beverages',
        icon: 'Coffee',
        items: [
            { name: 'Espresso', description: 'Double shot of espresso.', price: 3.5, icon: 'Coffee' },
            { name: 'Fresh Lemonade', description: 'House-made sparkling lemonade.', price: 5.0, icon: 'GlassWater' },
            { name: 'Craft Beer', description: 'Local IPA on tap.', price: 7.0, icon: 'Beer' },
            { name: 'Red Wine', description: 'Glass of Cabernet Sauvignon.', price: 11.0, icon: 'Wine' },
        ],
    },
];

export async function seedDemoData(shopId: string) {
    const supabase = await createClient();

    // 1. Get current max category order to append
    const { data: maxOrder } = await supabase
        .from('categories')
        .select('order_index')
        .eq('shop_id', shopId)
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

    let currentOrder = (maxOrder?.order_index ?? -1) + 1;

    for (const cat of DEMO_CATEGORIES) {
        // Create Category
        const { data: categoryData, error: catError } = await supabase
            .from('categories')
            .insert({
                shop_id: shopId,
                name: cat.name,
                icon: cat.icon,
                order_index: currentOrder++,
            })
            .select('id')
            .single();

        if (catError) {
            console.error('Error creating category:', catError);
            continue;
        }

        const categoryId = categoryData.id;

        // Create Items
        const itemsToInsert = cat.items.map((item, idx) => ({
            category_id: categoryId,
            name: item.name,
            description: item.description,
            price: item.price,
            icon: item.icon,
            is_available: true,
            // order_index: idx // Add this if order_index exists on menu_items
        }));

        const { error: itemsError } = await supabase.from('menu_items').insert(itemsToInsert);

        if (itemsError) {
            console.error('Error creating items:', itemsError);
        }
    }

    revalidatePath('/menu-builder');
    return { success: true };
}
