import { Shop } from '@/types/database';
import { Database } from '@/types/database.types';
import { createClient } from '@/utils/supabase/server';

export async function createShop(formData: FormData) {
    const supabase = await createClient<Database>();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const name = formData.get('name')?.toString();
    //const type = formData.get('type')?.toString();

    if (!name) {
        return { error: 'Missing required fields' };
    }

    const randomSlug = Array.from(crypto.getRandomValues(new Uint8Array(5)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

    const { error } = await supabase.from('shops').insert({
        owner_id: user.id,
        name,
        type: 'restaurant',
        slug: randomSlug,
    });

    if (error) {
        if (error.code === '23505') return { error: 'System collision, try again.' };
        console.error('Create Shop Error:', error);
        return { error: error.message };
    }

    return { success: true };
}

export async function getShops(): Promise<{ shops: Shop[]; error?: string }> {
    const supabase = await createClient<Database>();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated', shops: [] };

    const { data: shops, error } = await supabase.from('shops').select('*').eq('owner_id', user.id).order('created_at', { ascending: false });

    if (error) {
        console.error('getShops Error:', error);
        return { error: error.message, shops: [] };
    }

    return { shops: shops ?? [] };
}
