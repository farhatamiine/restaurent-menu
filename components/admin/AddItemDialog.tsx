'use client';

import { Category } from '@/types/database';
import { useState } from 'react';
import ItemFormDialog from './ItemFormDialog';

export default function AddItemDialog({ categories, children, shopId }: { categories?: Category[]; children: React.ReactNode; shopId: string }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div onClick={() => setOpen(true)}>{children}</div>
            <ItemFormDialog open={open} onOpenChange={setOpen} categories={categories} shopId={shopId} />
        </>
    );
}
