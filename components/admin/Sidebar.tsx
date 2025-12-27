'use client';

import { signout } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';
import { BarChart3, LayoutDashboard, LogOut, QrCode, Settings, User as UserIcon, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Menu Editor', href: '/menu-builder', icon: UtensilsCrossed },
    { name: 'QR Code', href: '/qr-code', icon: QrCode },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ user }: { user: User }) {
    const pathname = usePathname();

    return (
        <div className="flex w-64 flex-col justify-between border-r bg-white p-4 dark:bg-gray-800 dark:border-gray-700">
            <div>
                <div className="mb-8 flex items-center gap-2 px-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                        <UtensilsCrossed className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">GourmetOS</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Admin Console</p>
                    </div>
                </div>

                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t pt-4 dark:border-gray-700">
                <div className="mb-4 flex items-center gap-3 px-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                        <UserIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{user.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Manager</p>
                    </div>
                </div>
                <form action={signout}>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </form>
            </div>
        </div>
    );
}
