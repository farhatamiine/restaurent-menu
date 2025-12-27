'use server';

import { MenuData, Shop } from '@/types/database';
import { createClient } from '@/utils/supabase/server';

export async function getShopBySlug(slug: string): Promise<{ shop?: Shop; error?: string }> {
    const supabase = await createClient();
    const { data: shop, error } = await supabase.from('shops').select('*').eq('slug', slug).single();

    if (error) return { error: error.message };
    return { shop: shop ?? undefined };
}

export async function getPublicMenu(shopId: string): Promise<{ categories: MenuData[]; error?: string }> {
    const supabase = await createClient();
    const { data: categories, error } = await supabase
        .from('categories')
        .select(
            `
            *,
            items:menu_items(*)
        `
        )
        .eq('shop_id', shopId)
        .order('order_index', { ascending: true });

    if (error) return { categories: [], error: error.message };
    // we could filter is_available on server, or client. Client allows "Out of stock" display.
    // prompt says: "Out of Stock" items should be grayed out in real-time. So send all.

    // Sort items logic (default created_at or name if needed)

    return { categories: categories as MenuData[] };
}
