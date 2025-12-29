'use client';

import { deleteCategory, reorderItems } from '@/actions/menu';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
import { ICONS } from '@/lib/icons';
import { Category, MenuItem } from '@/types/database';
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import CategoryFormDialog from './CategoryFormDialog';
import MenuItemCard from './MenuItemCard';

type MenuData = Category & {
    items: MenuItem[];
};

export default function CategoryItem({ category, shopId, categories }: { category: MenuData; shopId: string; categories: Category[] }) {
    const queryClient = useQueryClient();
    // Local state for items to handle internal reordering
    const [items, setItems] = useState(category.items || []);

    // Sync with props
    useEffect(() => {
        setItems(category.items || []);
    }, [category.items]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleItemDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setItems((currentItems) => {
                const oldIndex = currentItems.findIndex((i) => i.id === active.id);
                const newIndex = currentItems.findIndex((i) => i.id === over.id);
                const newItems = arrayMove(currentItems, oldIndex, newIndex);

                // Optimistic Server Action
                const updates = newItems.map((item, index) => ({
                    id: item.id,
                    order_index: index,
                }));
                reorderItems(updates);

                return newItems;
            });
        }
    };

    // Sortable hook for the category itself
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id, data: { type: 'Category', category } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    // ... (in component)

    const CategoryIcon = category.icon && ICONS[category.icon as keyof typeof ICONS] ? ICONS[category.icon as keyof typeof ICONS] : null;

    const { mutate: deleteCategoryMutation, isPending: isDeleting } = useMutation({
        mutationFn: async () => {
            const result = await deleteCategory(category.id);
            if (result?.error) throw new Error(result.error);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu', shopId] });
        },
        onError: (error) => {
            alert(error.message);
        },
    });

    // Need access to queryClient.
    // Since CategoryItem didn't use useQueryClient before, I'll add it or just pass a callback?
    // It's cleaner to use useQueryClient.

    return (
        <div ref={setNodeRef} style={style} className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm mb-4">
            <Accordion type="single" collapsible defaultValue={category.id} className="w-full">
                <AccordionItem value={category.id} className="border-b-0">
                    <div className="flex items-center w-full pr-4">
                        <div {...attributes} {...listeners} className="p-4 cursor-grab text-gray-400 hover:text-gray-600">
                            <GripVertical className="h-5 w-5" />
                        </div>
                        <AccordionTrigger className="hover:no-underline flex-1 py-4">
                            <div className="flex items-center gap-3 w-full">
                                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-100 text-blue-600">
                                    {CategoryIcon ? (
                                        <CategoryIcon className="h-5 w-5" />
                                    ) : (
                                        <span className="text-xs font-bold">{category.name.substring(0, 2).toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="text-left flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                                    <p className="text-xs text-gray-500 font-normal">{items.length} items active</p>
                                </div>
                            </div>
                        </AccordionTrigger>

                        {/* Category Actions */}
                        <div className="flex items-center gap-2 ml-2">
                            <CategoryFormDialog shopId={shopId} category={category}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600" onClick={(e) => e.stopPropagation()}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </CategoryFormDialog>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-400 hover:text-red-600"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete <span className="font-semibold">"{category.name}"</span>?
                                            {items.length > 0 && (
                                                <span className="block mt-2 text-red-600 font-medium">
                                                    Warning: It contains {items.length} items. You must delete them first.
                                                </span>
                                            )}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteCategoryMutation();
                                            }}
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                            disabled={isDeleting || items.length > 0}
                                        >
                                            {isDeleting ? 'Deleting...' : 'Delete'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                    <AccordionContent className="pt-0 pb-4 px-4 space-y-2 ml-10 border-l border-gray-100 dark:border-gray-700">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleItemDragEnd}>
                            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                                {items.map((item) => (
                                    <MenuItemCard key={item.id} item={item} shopId={shopId} categories={categories} />
                                ))}
                            </SortableContext>
                        </DndContext>
                        {items.length === 0 && <p className="text-sm text-gray-400 italic">No items in this category.</p>}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
