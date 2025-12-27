'use client';

import { createCategory } from '@/actions/menu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useTransition } from 'react';

export default function AddCategoryDialog({ children, shopId }: { children: React.ReactNode; shopId: string }) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(formData: FormData) {
        if (!shopId) {
            alert('No shop selected');
            return;
        }
        startTransition(async () => {
            const result = await createCategory(formData.get('name') as string, shopId);
            if (result?.error) {
                alert(result.error);
            } else {
                setOpen(false);
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>Add Category</DialogTitle>
                    <DialogDescription>Create a new section for your menu (e.g. Appetizers).</DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} id="add-cat-form" className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Category Name</Label>
                        <Input id="name" name="name" placeholder="e.g. Main Courses" required />
                    </div>
                </form>
                <DialogFooter>
                    <Button type="submit" form="add-cat-form" disabled={isPending}>
                        {isPending ? 'Creating...' : 'Create Category'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
