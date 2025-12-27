'use client';

import { Input } from '@/components/ui/input';
import { MenuData, Shop } from '@/types/database';
import { createClient } from '@/utils/supabase/client';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import StickyNav from './StickyNav';

// Utility for classnames if utils doesn't exist
function classNames(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

export default function CustomerMenu({ initialCategories, shop }: { initialCategories: MenuData[]; shop: Shop }) {
    const [categories, setCategories] = useState(initialCategories);
    const [searchQuery, setSearchQuery] = useState('');
    const supabase = createClient();

    useEffect(() => {
        // Subscribe to real-time changes
        const channel = supabase
            .channel('menu-updates')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to all events
                    schema: 'public',
                    table: 'menu_items',
                    // FILTERING: We can filter by shop but the table checks might be limited.
                    // Best to just listen and filter locally or use RLS polices if possible via 'filter'.
                    // "filter" string in Supabase realtime is limited.
                    // We'll rely on client-side filtering or just re-fetch for simplicity if ID matches.
                },
                (payload) => {
                    // Optimistic/Real-time update
                    // Ideally we'd re-fetch via React Query or splice the state.
                    // Let's simple re-integration:
                    if (payload.eventType === 'UPDATE') {
                        setCategories((prev) =>
                            prev.map((cat) => ({
                                ...cat,
                                items: cat.items.map((item) => (item.id === payload.new.id ? { ...item, ...payload.new } : item)),
                            }))
                        );
                    } else if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
                        // For structure changes, safer to just reload or careful splice.
                        // For now, let's just handle updates (availability).
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    // Filter Items
    const filteredCategories = categories
        .map((cat) => ({
            ...cat,
            items: cat.items.filter(
                (item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description?.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        }))
        .filter((cat) => cat.items.length > 0);

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-10 shadow-sm space-y-4">
                <h1 className="text-2xl font-bold text-center">{shop.name}</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search for items..."
                        className="pl-9 bg-gray-100 border-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Horizontal Categories Nav */}
            <StickyNav categories={filteredCategories} />

            {/* Menu Items */}
            <div className="p-4 space-y-8">
                {filteredCategories.map((category) => (
                    <div key={category.id} id={`cat-${category.id}`} className="scroll-mt-32">
                        <h2 className="text-xl font-bold mb-4">{category.name}</h2>
                        <div className="space-y-4">
                            {category.items.map((item) => (
                                <div key={item.id} className={classNames('flex gap-4', !item.is_available && 'opacity-50 grayscale')}>
                                    <div className="h-24 w-24 relative flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                                        {item.image_url ? (
                                            <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">img</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-lg leading-tight">{item.name}</h3>
                                            <span className="font-bold">${item.price?.toFixed(2)}</span>
                                        </div>
                                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.description}</p>
                                        {!item.is_available && (
                                            <span className="inline-block mt-2 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full font-medium">
                                                Out of Stock
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
