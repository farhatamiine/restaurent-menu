'use client';

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
        <div className="sticky top-[88px] z-10 bg-white border-b shadow-sm overflow-x-auto no-scrollbar">
            <div className="flex px-4 gap-6 min-w-max">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => scrollToCategory(cat.id)}
                        className={cn(
                            'py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                            activeId === cat.id ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-800'
                        )}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
