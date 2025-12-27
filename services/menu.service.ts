import { MenuData } from '@/types/database';
import { Database } from '@/types/database.types';
import { createClient } from '@/utils/supabase/server';

export async function getMenu(shopId: string): Promise<{ categories: MenuData[]; error?: string }> {
    const supabase = await createClient<Database>();
    const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select(
            `
            *,
            items:menu_items(*)
        `
        )
        .eq('shop_id', shopId)
        .order('order_index', { ascending: true })
        .order('order_index', { foreignTable: 'menu_items', ascending: true });

    if (categoriesError) {
        console.error('Fetch Menu Error:', categoriesError);
        return { categories: [], error: 'Failed to load menu. Please try again.' };
    }

    if (!categories) return { categories: [] };

    return { categories: categories as MenuData[] };
}

export async function createCategory(name: string, shopId: string) {
    const supabase = await createClient<Database>();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: lastCategory, error: fetchError } = await supabase
        .from('categories')
        .select('order_index')
        .eq('shop_id', shopId)
        .order('order_index', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (fetchError) return { error: 'Error calculating position' };
    const nextIndex = (lastCategory?.order_index ?? -1) + 1;

    const { error: insertError } = await supabase.from('categories').insert({
        shop_id: shopId,
        name,
        order_index: nextIndex,
    });

    if (insertError) {
        // If RLS blocks it, this error message usually says "new row violates row-level security policy"
        console.error('Insert Error:', insertError);
        return { error: 'Failed to create category. Ensure you have permission for this shop.' };
    }

    return { success: true };
}

export async function reorderCategories(updates: { id: string; order_index: number }[]) {
    const supabase = await createClient<Database>();

    const { error } = await supabase.rpc('upsert_categories_order', {
        payload: updates,
    });

    if (error) {
        console.error('Reorder Error:', error);
        return {
            success: false,
            error: 'Failed to save new order. Please refresh and try again.',
        };
    }

    return { success: true };
}
