'use client';

import { ICONS } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { MenuData } from '@/types/database';
import { useEffect, useState } from 'react';

export default function StickyNav({ categories }: { categories: MenuData[] }) {
    const [activeId, setActiveId] = useState(categories[0]?.id);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id.replace('cat-', ''));
                    }
                });
            },
            { rootMargin: '-100px 0px -40% 0px' }
        );

        categories.forEach((cat) => {
            const el = document.getElementById(`cat-${cat.id}`);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [categories]);

    const scrollToCategory = (id: string) => {
        const el = document.getElementById(`cat-${id}`);
        if (el) {
            window.scrollTo({
                top: el.offsetTop - 150, // Offset for sticky headers
                behavior: 'smooth',
            });
            setActiveId(id);
        }
    };

    if (categories.length === 0) return null;

    return (
        <div className="flex px-4 gap-6 min-w-max pb-1">
            {categories.map((cat) => {
                const CategoryIcon = cat.icon && ICONS[cat.icon as keyof typeof ICONS] ? ICONS[cat.icon as keyof typeof ICONS] : null;

                return (
                    <button
                        key={cat.id}
                        onClick={() => scrollToCategory(cat.id)}
                        className={cn(
                            'group flex flex-col items-center gap-1 py-2 px-1 text-xs font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap',
                            activeId === cat.id
                                ? 'border-[#e85d56] text-[#e85d56]'
                                : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
                        )}
                    >
                        {/* Icon is optional in the tab bar if we want a cleaner look, but let's keep it small */}
                        {CategoryIcon && (
                            <CategoryIcon
                                className={cn('h-4 w-4 mb-0.5', activeId === cat.id ? 'text-[#e85d56]' : 'text-gray-300 group-hover:text-gray-400')}
                            />
                        )}
                        {cat.name}
                    </button>
                );
            })}
        </div>
    );
}
