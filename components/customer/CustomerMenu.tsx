'use client';

import { Input } from '@/components/ui/input';
import { ICONS } from '@/lib/icons';
import { MenuData, Shop } from '@/types/database';
import { createClient } from '@/utils/supabase/client';
import { MapPin, Phone, Search, Utensils } from 'lucide-react';
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

    // Force Japanese Theme for this view as requested
    const jpTheme = {
        bg: 'bg-seigaiha', // Cream + Pattern
        primary: 'bg-jp-red',
        textPrimary: 'text-jp-red',
        textBlack: 'text-jp-black',
        fontDisplay: 'font-jp-display',
    };

    useEffect(() => {
        // Subscribe to real-time changes
        const channel = supabase
            .channel('menu-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'menu_items',
                },
                (payload) => {
                    if (payload.eventType === 'UPDATE') {
                        setCategories((prev) =>
                            prev.map((cat) => ({
                                ...cat,
                                items: cat.items.map((item) => (item.id === payload.new.id ? { ...item, ...payload.new } : item)),
                            }))
                        );
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

    const SelectedIcon =
        shop.theme_config && (shop.theme_config as any).icon && ICONS[(shop.theme_config as any).icon] ? ICONS[(shop.theme_config as any).icon] : Utensils;

    return (
        <div className={`min-h-screen pb-20 ${jpTheme.bg} font-sans text-[#2d2d2d]`}>
            {/* Japanese Theme Hero Section */}
            <div className="relative pt-12 pb-6 px-6 text-center space-y-4">
                {/* Logo Area */}
                <div className="mx-auto w-24 h-24 border-4 border-[#2d2d2d] flex items-center justify-center bg-white shadow-lg transform rotate-45 mb-8 mt-4 overflow-hidden">
                    <div className="transform -rotate-45">
                        {/* If shop has logo, use it, else Icon */}
                        <SelectedIcon className="h-10 w-10 text-jp-black" strokeWidth={1.5} />
                    </div>
                </div>

                {/* Shop Title */}
                <div className="space-y-1">
                    <h2 className="text-xs uppercase tracking-[0.3em] text-gray-500">Welcome to</h2>
                    <h1 className={`text-3xl font-bold ${jpTheme.textBlack} ${jpTheme.fontDisplay}`}>{shop.name}</h1>
                </div>

                {/* Info / Description */}
                <p className="text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">
                    {/* Placeholder description if none exists */}
                    Experience authentic flavors with our carefully curated menu. Fresh ingredients, traditional recipes.
                </p>

                {/* Contact Info Pills */}
                <div className="flex justify-center gap-3 pt-2">
                    <div className="flex items-center gap-1 bg-white px-3 py-1.5 shadow-sm border border-gray-100 rounded-md">
                        <MapPin className="h-3 w-3 text-jp-red" />
                        <span className="text-xs font-medium">Map</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white px-3 py-1.5 shadow-sm border border-gray-100 rounded-md">
                        <Phone className="h-3 w-3 text-jp-red" />
                        <span className="text-xs font-medium">Call</span>
                    </div>
                </div>
            </div>

            {/* Separator Pattern */}
            <div
                className="h-4 w-full bg-repeat-x opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '8px 8px' }}
            ></div>

            {/* Sticky Nav (Restyled) */}
            <div className="sticky top-0 z-20 bg-[#FDF6F0]/95 backdrop-blur-sm border-b border-[#e5ded6] pt-2">
                {/* Search Bar */}
                <div className="px-4 pb-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search menu..."
                            className="pl-9 h-10 border-gray-200 bg-white/80 focus:ring-1 focus:ring-[#e85d56] rounded-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                {/* Horizontal Scroll Nav */}
                <StickyNav categories={filteredCategories} />
            </div>

            {/* Content Area */}
            <div className="p-4 space-y-12">
                {filteredCategories.map((category) => {
                    const CategoryIcon = category.icon && ICONS[category.icon as keyof typeof ICONS] ? ICONS[category.icon as keyof typeof ICONS] : null;

                    return (
                        <div key={category.id} id={`cat-${category.id}`} className="scroll-mt-40">
                            {/* Category Header */}
                            <div className="flex items-center justify-between mb-6 border-b border-[#e85d56]/20 pb-2">
                                <div className="flex items-center gap-3">
                                    {CategoryIcon && <CategoryIcon className="h-5 w-5 text-jp-red" strokeWidth={1.5} />}
                                    <h2 className={`text-xl font-bold ${jpTheme.textBlack} ${jpTheme.fontDisplay}`}>{category.name}</h2>
                                </div>
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{category.items.length} Options</span>
                            </div>

                            {/* Items Grid/List */}
                            <div className="grid gap-6">
                                {category.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`bg-white shadow-sm border border-gray-100 overflow-hidden group ${
                                            !item.is_available ? 'opacity-60 grayscale' : ''
                                        }`}
                                    >
                                        {/* Image Area */}
                                        <div className="aspect-[16/9] relative bg-gray-100">
                                            {item.image_url ? (
                                                <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-300">
                                                    <Utensils className="h-8 w-8 opacity-20" />
                                                </div>
                                            )}
                                            {/* Tag / Badge if needed */}
                                            {!item.is_available && (
                                                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                                    <span className="bg-black text-white px-3 py-1 text-xs uppercase tracking-widest font-bold">Sold Out</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content Area */}
                                        <div className="p-4 relative">
                                            {/* Red Title Badge Style from Ref Image */}
                                            <div className="mb-2">
                                                <h3
                                                    className={`inline-block ${jpTheme.primary} text-white px-2 py-0.5 text-xs font-bold uppercase tracking-widest mb-1 shadow-sm`}
                                                >
                                                    {item.name}
                                                </h3>
                                            </div>

                                            <div className="flex justify-between items-end gap-4">
                                                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 flex-1">
                                                    {item.description || 'Delicious traditional dish prepared with fresh ingredients.'}
                                                </p>
                                                <div className="text-right shrink-0">
                                                    <span className={`text-xl font-bold ${jpTheme.textPrimary}`}>${item.price?.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {filteredCategories.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                        <p>No items found matching your search.</p>
                    </div>
                )}
            </div>

            {/* Footer Branding */}
            <div className="text-center pb-8 pt-4">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Powered by MenuBuilder</p>
            </div>
        </div>
    );
}
