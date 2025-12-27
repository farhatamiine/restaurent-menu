'use client';

import { login, signup } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTransition } from 'react';

export default function LoginPage() {
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(formData: FormData, action: 'login' | 'signup') {
        startTransition(async () => {
            const result = await (action === 'login' ? login(formData) : signup(formData));
            if (result?.error) {
                alert(result.error); // Simple alert for now, can move to toast later
            }
        });
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Welcome</CardTitle>
                    <CardDescription>Login or create a new account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form id="auth-form" action={(formData) => handleSubmit(formData, 'login')} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button type="submit" form="auth-form" className="w-full" disabled={isPending}>
                        {isPending ? 'Loading...' : 'Sign In'}
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full"
                        disabled={isPending}
                        onClick={(e) => {
                            e.preventDefault();
                            const form = document.querySelector('#auth-form') as HTMLFormElement;
                            if (form) {
                                handleSubmit(new FormData(form), 'signup');
                            }
                        }}
                    >
                        Sign Up
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
