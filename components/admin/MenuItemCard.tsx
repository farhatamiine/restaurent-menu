import { deleteItem, updateItemAvailability } from '@/actions/menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Category, MenuItem } from '@/types/database';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import ItemFormDialog from './ItemFormDialog';

export default function MenuItemCard({ item, shopId, categories }: { item: MenuItem; shopId: string; categories: Category[] }) {
    const queryClient = useQueryClient();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Sortable Hook
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id, data: { type: 'Item', item } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    const { mutate: toggleAvailability, isPending } = useMutation({
        mutationFn: async (checked: boolean) => {
            await updateItemAvailability(item.id, checked);
        },
        onMutate: async (newItemAvailability) => {
            await queryClient.cancelQueries({ queryKey: ['menu', shopId] });
            const previousMenu = queryClient.getQueryData(['menu', shopId]);

            // Optimistic update
            queryClient.setQueryData(['menu', shopId], (old: { categories: (Category & { items: MenuItem[] })[] } | undefined) => {
                if (!old) return old;
                return {
                    ...old,
                    categories: old.categories.map((cat) => ({
                        ...cat,
                        items: cat.items.map((i) => (i.id === item.id ? { ...i, is_available: newItemAvailability } : i)),
                    })),
                };
            });
            return { previousMenu };
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(['menu', shopId], context?.previousMenu);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['menu', shopId] });
        },
    });

    const { mutate: deleteItemMutation, isPending: isDeleting } = useMutation({
        mutationFn: async () => {
            const result = await deleteItem(item.id);
            if (result?.error) throw new Error(result.error);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu', shopId] });
            setIsDeleteDialogOpen(false);
        },
        onError: (error) => {
            alert(error.message);
        },
    });

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
        >
            <div className="flex items-center gap-4 flex-1">
                {/* Drag Handle */}
                <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 outline-none">
                    <GripVertical className="h-5 w-5" />
                </div>

                <div className="h-12 w-12 relative rounded-md overflow-hidden bg-gray-200">
                    {item.image_url ? (
                        <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                    )}
                </div>
                <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                    <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <span className="font-semibold text-gray-900 dark:text-white">${item.price?.toFixed(2)}</span>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setIsEditOpen(true)} className="h-8 w-8 text-gray-400 hover:text-blue-600">
                        <Pencil className="h-4 w-4" />
                    </Button>

                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{item.name}"</span>? This
                                    action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => deleteItemMutation()}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <Switch checked={item.is_available ?? false} onCheckedChange={(checked) => toggleAvailability(checked)} disabled={isPending} />
                    <span className="text-xs text-gray-500 w-12">{item.is_available ? 'Visible' : 'Hidden'}</span>
                </div>
            </div>

            <ItemFormDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                shopId={shopId}
                itemToEdit={{ ...item, icon: (item as any).icon }}
                categories={categories}
            />
        </div>
    );
}
