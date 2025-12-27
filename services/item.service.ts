import { MenuItem } from '@/types/database';
import { Database } from '@/types/database.types';
import { createClient } from '@/utils/supabase/server';

export async function createMenuItem(categoryId: string, item: Partial<MenuItem>) {
    const supabase = await createClient<Database>();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    // 1. Get the next order_index for this specific category
    const { data: lastItem } = await supabase
        .from('menu_items')
        .select('order_index')
        .eq('category_id', categoryId)
        .order('order_index', { ascending: false })
        .limit(1)
        .maybeSingle();

    const nextIndex = (lastItem?.order_index ?? -1) + 1;

    // 2. Insert with the new index
    const { error } = await supabase.from('menu_items').insert({
        name: item.name ?? 'New Item',
        category_id: categoryId,
        description: item.description,
        price: item.price,
        image_url: item.image_url,
        order_index: nextIndex,
        is_available: true,
    });

    if (error) {
        console.error('Create Item Error:', error);
        return { error: 'Failed to create item. Verify your permissions.' };
    }

    return { success: true };
}

export async function updateItemAvailability(itemId: string, isAvailable: boolean) {
    const supabase = await createClient<Database>();
    const { error } = await supabase.from('menu_items').update({ is_available: isAvailable }).eq('id', itemId);

    if (error) return { error: error.message };
    return { success: true };
}

export async function deleteItem(itemId: string) {
    const supabase = await createClient<Database>();
    const { error } = await supabase.from('menu_items').delete().eq('id', itemId);

    if (error) return { error: error.message };
    return { success: true };
}

export async function reorderItems(updates: { id: string; order_index: number }[]) {
    const supabase = await createClient<Database>();

    // One single request, one single transaction
    const { error } = await supabase.rpc('upsert_menu_items_order', {
        payload: updates,
    });

    if (error) {
        console.error('Reorder Items Error:', error);
        return {
            success: false,
            error: 'Failed to update item order. Please try again.',
        };
    }

    return { success: true };
}
