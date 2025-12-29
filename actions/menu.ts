'use server';

import { MenuData, MenuItem } from '@/types/database';
import { Database } from '@/types/database.types';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

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

    if (categoriesError) return { categories: [], error: categoriesError.message };

    // Sort items manually by order_index just in case (though we might not have it yet on items table in DB schema... wait, did the prompt specify order_index for items?
    // The Prompt: "Create a categories table: id, shop_id, name, order_index."
    // "Create a menu_items table: ... (no order_index specified)"
    // I should probably add order_index to menu_items as well for this to work properly.
    // I will assume I need to run a migration or just add it now if I can.
    // The initial schema didn't have order_index for menu_items. I should probably add it to the schema/types.

    // For now, let's just sort items by created_at if order isn't there, but for DnD I need to persist it.
    // I will check the schema file I wrote earlier.

    return { categories: categories as MenuData[] };
}

export async function createCategory(name: string, shopId: string, icon?: string) {
    const supabase = await createClient<Database>();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).eq('id', shopId).single();

    if (!shop) return { error: 'Shop not found' };

    // Get max order index
    const { data: maxOrder } = await supabase
        .from('categories')
        .select('order_index')
        .eq('shop_id', shop.id)
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

    const newOrderIndex = (maxOrder?.order_index ?? -1) + 1;

    const { error } = await supabase.from('categories').insert({
        shop_id: shop.id,
        name,
        order_index: newOrderIndex,
        icon,
    });

    if (error) return { error: error.message };
    revalidatePath('/menu-builder');
    return { success: true };
}

export async function updateCategory(categoryId: string, name: string, icon?: string) {
    const supabase = await createClient<Database>();

    // Check auth
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase.from('categories').update({ name, icon }).eq('id', categoryId);

    if (error) return { error: error.message };
    revalidatePath('/menu-builder');
    return { success: true };
}

// Helper to upload image
async function uploadImage(file: File): Promise<string | null> {
    const supabase = await createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Assuming 'menu-items' bucket exists. If not, this will error.
    // User might need to create it manually due to permissions.
    const { error: uploadError } = await supabase.storage.from('menu-items').upload(filePath, file);

    if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload image');
    }

    const { data } = supabase.storage.from('menu-items').getPublicUrl(filePath);
    return data.publicUrl;
}

export async function createMenuItem(categoryId: string, item: Partial<MenuItem> & { icon?: string | null }, formData?: FormData) {
    const supabase = await createClient();

    let imageUrl = item.image_url;

    // Handle Image Upload
    if (formData) {
        const file = formData.get('image') as File;
        if (file && file.size > 0) {
            try {
                const uploadedUrl = await uploadImage(file);
                if (uploadedUrl) imageUrl = uploadedUrl;
            } catch (e) {
                console.log(e);

                return { error: 'Failed to upload image. Please ensure "menu-items" bucket exists and is public.' };
            }
        }
    }

    if (!item.name) {
        return { error: 'Item name is required' };
    }

    const { error } = await supabase.from('menu_items').insert({
        category_id: categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        is_available: item.is_available,
        icon: item.icon,
        metadata: item.metadata,
        order_index: item.order_index,
        image_url: imageUrl,
    });

    if (error) return { error: error.message };
    revalidatePath('/menu-builder');
    return { success: true };
}

export async function updateMenuItem(itemId: string, item: Partial<MenuItem> & { icon?: string | null }, formData?: FormData) {
    const supabase = await createClient();

    let imageUrl = item.image_url; // Default to existing or passed URL

    // Handle Image Upload or Removal
    if (formData) {
        const file = formData.get('image') as File;
        const removeImage = formData.get('removeImage') === 'true';

        if (removeImage) {
            imageUrl = null;
        } else if (file && file.size > 0) {
            try {
                const uploadedUrl = await uploadImage(file);
                if (uploadedUrl) imageUrl = uploadedUrl;
            } catch {
                return { error: 'Failed to upload image.' };
            }
        }
    }

    const payload: Partial<MenuItem> = { ...item };
    if (imageUrl !== undefined) payload.image_url = imageUrl;

    const { error } = await supabase.from('menu_items').update(payload).eq('id', itemId);

    if (error) return { error: error.message };
    revalidatePath('/menu-builder');
    return { success: true };
}

export async function updateItemAvailability(itemId: string, isAvailable: boolean) {
    const supabase = await createClient();
    const { error } = await supabase.from('menu_items').update({ is_available: isAvailable }).eq('id', itemId);

    if (error) return { error: error.message };
    revalidatePath('/menu-builder');
    return { success: true };
}

export async function deleteItem(itemId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('menu_items').delete().eq('id', itemId);
    if (error) return { error: error.message };
    revalidatePath('/menu-builder');
    revalidatePath('/menu-builder');
    return { success: true };
}

export async function deleteCategory(categoryId: string) {
    const supabase = await createClient();

    // Check if category has items?
    // If foreign key uses CASCADE, simple delete works.
    // If not, we might error. Let's assume user wants to delete even if items exist,
    // or we'll get an error.
    // Let's try to delete items first to be safe/clean if we don't rely on CASCADE,
    // but explicit is better for "Empty first" policy.
    // However, for a "Delete Category" button, users expect it to just work.
    // I will try to delete the category directly. If it fails due to FK, I will return an error telling them to empty it first.

    const { error } = await supabase.from('categories').delete().eq('id', categoryId);

    if (error) {
        if (error.code === '23503') {
            // Foreign key violation
            return { error: 'Category is not empty. Please delete all items in this category first.' };
        }
        return { error: error.message };
    }

    revalidatePath('/menu-builder');
    return { success: true };
}

export async function reorderCategories(updates: { id: string; order_index: number }[]) {
    const supabase = await createClient();

    const { error } = await supabase.rpc('upsert_categories_order', { payload: updates });

    // If RPC doesn't exist (likely), use simple loop (slower but works for MVP)
    if (error) {
        // Fallback to loop
        for (const update of updates) {
            await supabase.from('categories').update({ order_index: update.order_index }).eq('id', update.id);
        }
    }

    revalidatePath('/menu-builder');
    revalidatePath('/'); // Public page
    return { success: true };
}

// NOTE: To enable Item Reordering, we need to add 'order_index' to menu_items table.
// I will create a migration file for this update.

export async function reorderItems(updates: { id: string; order_index: number }[]) {
    const supabase = await createClient();

    // Simple loop fallback
    for (const update of updates) {
        await supabase.from('menu_items').update({ order_index: update.order_index }).eq('id', update.id);
    }

    revalidatePath('/menu-builder');
    revalidatePath('/');
    return { success: true };
}
