'use client';

import { createMenuItem, updateMenuItem } from '@/actions/menu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ICONS } from '@/lib/icons';
import { Category, MenuItem } from '@/types/database';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, X } from 'lucide-react';
import Image from 'next/image';
import { ChangeEvent, useEffect, useState } from 'react';

// Extended type to include icon until DB is fully migrated
type ExtendedMenuItem = MenuItem & { icon?: string | null };

interface ItemFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories?: Category[];
    shopId: string;
    itemToEdit?: ExtendedMenuItem | null;
}

export default function ItemFormDialog({ open, onOpenChange, categories, shopId, itemToEdit }: ItemFormDialogProps) {
    const queryClient = useQueryClient();
    const isEditing = !!itemToEdit;

    // Form State
    const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Reset form when opening/closing or changing item
    useEffect(() => {
        if (open) {
            if (itemToEdit) {
                setSelectedIcon(itemToEdit.icon || null);
                setImagePreview(itemToEdit.image_url || null);
            } else {
                setSelectedIcon(null);
                setImagePreview(null);
            }
            setImageFile(null);
        }
    }, [open, itemToEdit]);

    const { mutate, isPending } = useMutation({
        mutationFn: async (formData: FormData) => {
            const categoryId = formData.get('categoryId') as string;
            const name = formData.get('name') as string;
            const description = formData.get('description') as string;
            const price = parseFloat(formData.get('price') as string);

            // Optimization: If we have a file, we need to upload it.
            // Since we can't easily use server actions for file upload without `status` complexity,
            // we will pass the file to the action if we can, or encode it.
            // Actually, Server Actions support FormData with File.

            const payload = {
                category_id: categoryId,
                name,
                description,
                price,
                icon: selectedIcon,
            };

            if (isEditing && itemToEdit) {
                return await updateMenuItem(itemToEdit.id, payload, formData);
            } else {
                return await createMenuItem(categoryId, payload, formData);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu', shopId] });
            onOpenChange(false);
        },
        onError: (error) => {
            alert(error.message);
        },
    });

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file); // For submission
            const url = URL.createObjectURL(file);
            setImagePreview(url); // For preview
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                    <DialogDescription>{isEditing ? 'Update item details.' : 'Add a new dish to your menu.'}</DialogDescription>
                </DialogHeader>

                <form action={mutate} id="item-form" className="grid gap-6 py-4">
                    {/* Image Upload */}
                    <div className="flex flex-col gap-2">
                        <Label>Item Image</Label>
                        <div className="flex items-start gap-4">
                            <div className="h-24 w-24 relative rounded-md overflow-hidden bg-gray-100 border flex items-center justify-center flex-shrink-0">
                                {imagePreview ? (
                                    <>
                                        <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </>
                                ) : (
                                    <ImagePlus className="h-8 w-8 text-gray-300" />
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <Input type="file" accept="image/*" name="image" onChange={handleImageChange} className="cursor-pointer" />
                                <p className="text-xs text-gray-500">Supported formats: .jpg, .png, .webp. Max 2MB.</p>
                                <input type="hidden" name="removeImage" value={!imagePreview ? 'true' : 'false'} />
                                <input type="hidden" name="shopId" value={shopId} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Select name="categoryId" defaultValue={itemToEdit?.category_id} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories?.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="price">Price ($)</Label>
                            <Input id="price" name="price" type="number" step="0.01" placeholder="0.00" defaultValue={itemToEdit?.price || ''} required />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" placeholder="e.g. Truffle Fries" defaultValue={itemToEdit?.name || ''} required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="Ingredients, details..." defaultValue={itemToEdit?.description || ''} />
                    </div>

                    {/* Icon Picker (Optional) */}
                    <div className="grid gap-2">
                        <Label>Item Icon (Optional fallback)</Label>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant={selectedIcon === null ? 'default' : 'outline'}
                                className="h-9 px-3 text-xs"
                                onClick={() => setSelectedIcon(null)}
                            >
                                None
                            </Button>
                            {Object.entries(ICONS).map(([name, Icon]) => (
                                <Button
                                    key={name}
                                    type="button"
                                    variant={selectedIcon === name ? 'default' : 'outline'}
                                    className={`h-9 w-9 p-0 ${selectedIcon === name ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                                    onClick={() => setSelectedIcon(name)}
                                    title={name}
                                >
                                    <Icon className="h-4 w-4" />
                                </Button>
                            ))}
                        </div>
                    </div>
                </form>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button type="submit" form="item-form" disabled={isPending}>
                        {isPending ? 'Saving...' : isEditing ? 'Update Item' : 'Add Item'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
