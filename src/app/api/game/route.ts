import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        questions: {
          include: {
            hints: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching game data:', error);
    return NextResponse.json({ error: 'Failed to fetch game data' }, { status: 500 });
  }
} 