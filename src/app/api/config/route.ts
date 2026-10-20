import { NextResponse } from 'next/server';
import { getCloudConfig, updateCloudConfig } from '@/lib/cloudDb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = await getCloudConfig();
  return NextResponse.json(config);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const success = await updateCloudConfig(body);
    const updated = await getCloudConfig();
    return NextResponse.json({ success, config: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
