import { NextResponse } from 'next/server';
import { getCloudCategories } from '@/lib/cloudDb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const categories = await getCloudCategories();
  return NextResponse.json(categories);
}
