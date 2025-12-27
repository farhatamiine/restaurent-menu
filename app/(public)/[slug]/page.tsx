import { getPublicMenu, getShopBySlug } from '@/actions/public';
import CustomerMenu from '@/components/customer/CustomerMenu';
import { notFound } from 'next/navigation';

// Correct usage of generateMetadata in Next 15: params is a Promise
export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { shop } = await getShopBySlug(params.slug);
    return {
        title: shop?.name || 'Menu',
    };
}

export default async function PublicMenuPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { shop } = await getShopBySlug(params.slug);
    if (!shop) return notFound();

    const { categories } = await getPublicMenu(shop.id);

    return <CustomerMenu initialCategories={categories} shop={shop} />;
}
