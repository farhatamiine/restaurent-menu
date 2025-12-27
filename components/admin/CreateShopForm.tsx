'use client';

import { createShop } from '@/actions/shop';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransition } from 'react';

export default function CreateShopForm() {
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            const result = await createShop(formData);
            if (result?.error) {
                alert(result.error);
            }
        });
    }

    return (
        <div className="flex justify-center">
            <Card className="w-[450px]">
                <CardHeader>
                    <CardTitle>Create Your Shop</CardTitle>
                    <CardDescription>You need to create a shop before managing your menu.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form id="create-shop-form" action={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Shop Name</Label>
                            <Input id="name" name="name" placeholder="My Awesome Cafe" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="slug">URL Slug</Label>
                            <Input id="slug" name="slug" placeholder="my-awesome-cafe" required />
                            <p className="text-xs text-gray-500">Your menu will be at /[slug]</p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type">Shop Type</Label>
                            <Select name="type" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="restaurant">Restaurant</SelectItem>
                                    <SelectItem value="barber">Barber</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </form>
                </CardContent>
                <CardFooter>
                    <Button type="submit" form="create-shop-form" className="w-full" disabled={isPending}>
                        {isPending ? 'Creating...' : 'Create Shop'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
