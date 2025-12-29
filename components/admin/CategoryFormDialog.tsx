'use client';

import { createCategory, updateCategory } from '@/actions/menu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ICONS } from '@/lib/icons';
import { Category } from '@/types/database';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface CategoryFormDialogProps {
    children: React.ReactNode;
    shopId: string;
    category?: Category; // If present, update mode
}

export default function CategoryFormDialog({ children, shopId, category }: CategoryFormDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState<string>(category?.icon || 'Utensils');
    const queryClient = useQueryClient();

    const isEdit = !!category;

    const { mutate, isPending } = useMutation({
        mutationFn: async (formData: FormData) => {
            const name = formData.get('name') as string;

            if (isEdit && category) {
                const result = await updateCategory(category.id, name, selectedIcon);
                if (result?.error) throw new Error(result.error);
                return result;
            } else {
                if (!shopId) throw new Error('No shop selected');
                const result = await createCategory(name, shopId, selectedIcon);
                if (result?.error) throw new Error(result.error);
                return result;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu', shopId] });
            setOpen(false);
            if (!isEdit) setSelectedIcon('Utensils'); // Reset only on create
        },
        onError: (error) => {
            alert(error.message);
        },
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Category' : 'Add Category'}</DialogTitle>
                    <DialogDescription>{isEdit ? 'Update category details.' : 'Create a new section for your menu (e.g. Appetizers).'}</DialogDescription>
                </DialogHeader>
                <form action={mutate} id="category-form" className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Category Name</Label>
                        <Input id="name" name="name" defaultValue={category?.name || ''} placeholder="e.g. Main Courses" required />
                    </div>

                    <div className="grid gap-2">
                        <Label>Category Icon</Label>
                        <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
                            {Object.entries(ICONS).map(([name, Icon]) => (
                                <Button
                                    key={name}
                                    type="button"
                                    variant={selectedIcon === name ? 'default' : 'outline'}
                                    className={`h-10 w-10 p-0 ${selectedIcon === name ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                                    onClick={() => setSelectedIcon(name)}
                                    title={name}
                                >
                                    <Icon className="h-5 w-5" />
                                </Button>
                            ))}
                        </div>
                    </div>
                </form>
                <DialogFooter>
                    <Button type="submit" form="category-form" disabled={isPending}>
                        {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Category'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
