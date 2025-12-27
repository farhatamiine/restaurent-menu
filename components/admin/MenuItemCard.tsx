'use client';

import { updateItemAvailability } from '@/actions/menu';
import { Switch } from '@/components/ui/switch';
import { Category, MenuItem } from '@/types/database';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GripVertical } from 'lucide-react'; // Added Trash2 just in case
import Image from 'next/image';

export default function MenuItemCard({ item, shopId }: { item: MenuItem; shopId: string }) {
    const queryClient = useQueryClient();

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
                    <Switch checked={item.is_available} onCheckedChange={(checked) => toggleAvailability(checked)} disabled={isPending} />
                    <span className="text-xs text-gray-500 w-12">{item.is_available ? 'Visible' : 'Hidden'}</span>
                </div>
            </div>
        </div>
    );
}
