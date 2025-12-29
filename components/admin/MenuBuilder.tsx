'use client';

import { getMenu } from '@/actions/menu';
import { getShops } from '@/actions/shop';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeConfig } from '@/types/database';
import { useQuery } from '@tanstack/react-query';
import { Plus, Settings, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import AddItemDialog from './AddItemDialog';
import CategoryFormDialog from './CategoryFormDialog';
import CategoryItem from './CategoryItem';
import CreateShopForm from './CreateShopForm';
import ShopCustomizationForm from './ShopCustomizationForm';

import { reorderCategories } from '@/actions/menu';
import { seedDemoData } from '@/actions/seed'; // Import seed action
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query'; // Import useMutation
import { Loader2, Wand2 } from 'lucide-react'; // Import icons

function DemoDataButton({ shopId }: { shopId: string }) {
    const queryClient = useQueryClient();
    const { mutate, isPending } = useMutation({
        mutationFn: async () => await seedDemoData(shopId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu', shopId] });
        },
    });

    if (!shopId) return null;

    return (
        <Button variant="secondary" onClick={() => mutate()} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
            Demo Menu
        </Button>
    );
}

export default function MenuBuilder() {
    const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

    // Fetch Shops Logic
    const { data: shopsData, isLoading: isShopsLoading } = useQuery({
        queryKey: ['shops'],
        queryFn: () => getShops(),
    });

    const shops = shopsData?.shops || [];

    // Auto-select first shop if none selected
    useEffect(() => {
        if (shops.length > 0 && !selectedShopId) {
            setSelectedShopId(shops[0].id);
        }
    }, [shops, selectedShopId]);

    // Fetch Menu Logic
    const { data: menuData, isLoading: isMenuLoading } = useQuery({
        queryKey: ['menu', selectedShopId],
        queryFn: () => (selectedShopId ? getMenu(selectedShopId) : Promise.reject('No shop selected')),
        enabled: !!selectedShopId,
    });

    // Local state for optimistic updates
    const [categories, setCategories] = useState(menuData?.categories || []);
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        if (menuData?.categories) {
            setCategories(menuData.categories);
        } else {
            setCategories([]);
        }
    }, [menuData]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            setCategories((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Optimistic UI
                const updates = newItems.map((item, index) => ({
                    id: item.id,
                    order_index: index,
                }));

                reorderCategories(updates);

                return newItems;
            });
        }
    };

    if (isShopsLoading) return <div className="text-center py-12">Loading Shops...</div>;

    // Check if user has NO shops at all
    if (!isShopsLoading && shops.length === 0) return <CreateShopForm />;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Menu Builder</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your digital menu items, categories, and availability.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={selectedShopId || ''} onValueChange={setSelectedShopId}>
                        <SelectTrigger className="w-50">
                            <Store className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Select Shop" />
                        </SelectTrigger>
                        <SelectContent>
                            {shops.map((shop) => (
                                <SelectItem key={shop.id} value={shop.id}>
                                    {shop.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {selectedShopId && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Settings className="h-5 w-5 text-gray-500" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogTitle className="sr-only">Customize Shop Theme</DialogTitle>
                                <ShopCustomizationForm
                                    shopId={selectedShopId}
                                    initialConfig={shops.find((s) => s.id === selectedShopId)?.theme_config as unknown as ThemeConfig}
                                />
                            </DialogContent>
                        </Dialog>
                    )}

                    <Button variant="outline">Generate QR</Button>
                    <DemoDataButton shopId={selectedShopId || ''} />
                    <AddItemDialog categories={categories} shopId={selectedShopId || ''}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="h-4 w-4 mr-2" /> Add New Item
                        </Button>
                    </AddItemDialog>
                </div>
            </div>

            {/* Wait for categories to load if we have a shop */}
            {isMenuLoading && selectedShopId ? (
                <div className="py-12 text-center text-gray-500">Loading Menu for selected shop...</div>
            ) : (
                <div className="space-y-4">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                        <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                            {categories.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                    <p className="text-gray-500">No categories found in this shop. Start by creating one.</p>
                                    <CategoryFormDialog shopId={selectedShopId || ''}>
                                        <Button variant="outline" className="mt-4">
                                            Create Category
                                        </Button>
                                    </CategoryFormDialog>
                                </div>
                            ) : (
                                <>
                                    {categories.map((category) => (
                                        <CategoryItem key={category.id} category={category} shopId={selectedShopId || ''} categories={categories} />
                                    ))}
                                    <div className="flex justify-center pt-4">
                                        <CategoryFormDialog shopId={selectedShopId || ''}>
                                            <Button variant="ghost">Add New Category</Button>
                                        </CategoryFormDialog>
                                    </div>
                                </>
                            )}
                        </SortableContext>
                        <DragOverlay>
                            {activeId ? (
                                <div className="opacity-80">
                                    <div className="bg-white p-4 rounded shadow-lg border">Moving Category...</div>
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            )}
        </div>
    );
}
