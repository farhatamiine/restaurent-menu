'use client';

import { updateShopTheme } from '@/actions/shop';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ICONS } from '@/lib/icons';
import { ThemeConfig } from '@/types/database';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface Props {
    shopId: string;
    initialConfig?: ThemeConfig | null; // Allow null
}

const defaultConfig: ThemeConfig = {
    primaryColor: '#2563eb', // blue-600
    backgroundColor: '#ffffff',
    textColor: '#1f2937', // gray-900
    borderRadius: '0.5rem',
    icon: 'Utensils',
};

export default function ShopCustomizationForm({ shopId, initialConfig }: Props) {
    const [config, setConfig] = useState<ThemeConfig>({
        ...defaultConfig,
        ...(initialConfig || {}),
    });
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: async (newConfig: ThemeConfig) => {
            const result = await updateShopTheme(shopId, newConfig);
            if (result?.error) throw new Error(result.error);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shops'] }); // Invalidate shops or specific shop theme query
            alert('Theme updated successfully!');
        },
        onError: (err) => {
            alert(err.message);
        },
    });

    const handleChange = (key: keyof ThemeConfig, value: string) => {
        setConfig((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Theme Customization</CardTitle>
                <CardDescription>Customize the look and feel of your public menu.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                        <Input
                            id="primaryColor"
                            type="color"
                            value={config.primaryColor}
                            onChange={(e) => handleChange('primaryColor', e.target.value)}
                            className="w-12 h-10 p-1 cursor-pointer"
                        />
                        <Input
                            value={config.primaryColor}
                            onChange={(e) => handleChange('primaryColor', e.target.value)}
                            placeholder="#000000"
                            className="flex-1"
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex gap-2">
                        <Input
                            id="backgroundColor"
                            type="color"
                            value={config.backgroundColor}
                            onChange={(e) => handleChange('backgroundColor', e.target.value)}
                            className="w-12 h-10 p-1 cursor-pointer"
                        />
                        <Input
                            value={config.backgroundColor}
                            onChange={(e) => handleChange('backgroundColor', e.target.value)}
                            placeholder="#FFFFFF"
                            className="flex-1"
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="textColor">Text Color</Label>
                    <div className="flex gap-2">
                        <Input
                            id="textColor"
                            type="color"
                            value={config.textColor}
                            onChange={(e) => handleChange('textColor', e.target.value)}
                            className="w-12 h-10 p-1 cursor-pointer"
                        />
                        <Input value={config.textColor} onChange={(e) => handleChange('textColor', e.target.value)} placeholder="#000000" className="flex-1" />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label>Restaurant Icon</Label>
                    <div className="grid grid-cols-5 gap-2">
                        {Object.entries(ICONS).map(([name, Icon]) => (
                            <Button
                                key={name}
                                variant={config.icon === name ? 'default' : 'outline'}
                                className={`h-10 w-10 p-0 ${config.icon === name ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                                onClick={() => handleChange('icon', name)}
                                title={name}
                                type="button"
                            >
                                <Icon className="h-5 w-5" />
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="borderRadius">Corner Radius</Label>
                    <Select value={config.borderRadius} onValueChange={(val) => handleChange('borderRadius', val)}>
                        <SelectTrigger id="borderRadius">
                            <SelectValue placeholder="Select radius" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0px">None (Square)</SelectItem>
                            <SelectItem value="0.5rem">Medium</SelectItem>
                            <SelectItem value="1rem">Large</SelectItem>
                            <SelectItem value="9999px">Full (Round)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button className="w-full" onClick={() => mutate(config)} disabled={isPending} style={{ backgroundColor: config.primaryColor }}>
                    {isPending ? 'Saving...' : 'Save Theme'}
                </Button>
            </CardContent>
        </Card>
    );
}
