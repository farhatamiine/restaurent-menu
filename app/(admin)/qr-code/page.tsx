'use client';

import { getShops } from '@/actions/shop';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { Download, Store } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';

export default function QRCodePage() {
    const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

    const { data: shopsData, isLoading } = useQuery({
        queryKey: ['shops'],
        queryFn: () => getShops(),
    });

    const shops = shopsData?.shops || [];

    // Auto-select first shop
    useEffect(() => {
        if (shops.length > 0 && !selectedShopId) {
            setSelectedShopId(shops[0].id);
        }
    }, [shops, selectedShopId]);

    const selectedShop = shops.find((s) => s.id === selectedShopId);
    const qrRef = useRef<SVGSVGElement>(null);

    const downloadQR = () => {
        const svg = qrRef.current;
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.download = `${selectedShop?.slug}-qr.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    if (isLoading) return <div>Loading...</div>;
    if (!shops || shops.length === 0) return <div>Please create a shop first.</div>;

    const shopUrl = typeof window !== 'undefined' && selectedShop ? `${window.location.origin}/${selectedShop.slug}` : '';

    return (
        <div className="max-w-xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">QR Code</h1>

            <div className="mb-6">
                <Select value={selectedShopId || ''} onValueChange={setSelectedShopId}>
                    <SelectTrigger className="w-full">
                        <Store className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Select Shop for QR Code" />
                    </SelectTrigger>
                    <SelectContent>
                        {shops.map((shop) => (
                            <SelectItem key={shop.id} value={shop.id}>
                                {shop.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{selectedShop ? selectedShop.name : 'Select a Shop'}</CardTitle>
                    <CardDescription>Scan this code to visit your digital menu. Download and print it for your tables.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6 pt-4">
                    {selectedShop ? (
                        <>
                            <div className="p-4 bg-white border rounded-xl">
                                <QRCodeSVG value={shopUrl} size={250} level="H" ref={qrRef} />
                            </div>
                            <p className="text-sm text-gray-500 break-all text-center">{shopUrl}</p>
                            <Button onClick={downloadQR} className="w-full sm:w-auto">
                                <Download className="mr-2 h-4 w-4" />
                                Download PNG
                            </Button>
                        </>
                    ) : (
                        <p>Select a shop to generate QR code.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
