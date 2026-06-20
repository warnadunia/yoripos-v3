import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    
    // Convert array of database settings to key-value record
    const data: Record<string, string> = {};
    settings.forEach((item) => {
      data[item.setting_key] = item.setting_value || '';
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('❌ GET_SETTINGS_ERROR:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memuat pengaturan toko.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const transaction = await prisma.$transaction(
      Object.entries(body).map(([key, value]) => {
        const valStr = typeof value === 'string' ? value : JSON.stringify(value);
        return prisma.setting.upsert({
          where: { setting_key: key },
          update: { setting_value: valStr },
          create: { setting_key: key, setting_value: valStr },
        });
      })
    );

    return NextResponse.json({
      success: true,
      message: 'Pengaturan toko berhasil disimpan.',
      data: transaction,
    });
  } catch (error: any) {
    console.error('❌ POST_SETTINGS_ERROR:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menyimpan pengaturan toko.' },
      { status: 500 }
    );
  }
}
