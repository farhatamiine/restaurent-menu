'use server';

import { Shop } from '@/types/database';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getShops(): Promise<{ shops?: Shop[]; error?: string }> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: shops, error } = await supabase.from('shops').select('*').eq('owner_id', user.id).order('created_at', { ascending: false });

    if (error) {
        return { error: error.message };
    }

    return { shops: shops ?? [] };
}

export async function createShop(formData: FormData) {
    console.log(formData);
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const name = formData.get('name') as string;
    const type = formData.get('type') as 'restaurant' | 'barber';
    const slug = formData.get('slug') as string;

    const { error } = await supabase.from('shops').insert({
        owner_id: user.id,
        name,
        type,
        slug,
    });

    if (error) return { error: error.message };
    revalidatePath('/dashboard');
    return { success: true };
}
