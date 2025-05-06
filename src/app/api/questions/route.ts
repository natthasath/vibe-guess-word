import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      include: {
        category: true,
        hints: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { answer, categoryId, hints } = body;

    const question = await prisma.question.create({
      data: {
        answer,
        categoryId,
        hints: {
          create: hints.map((content: string, index: number) => ({
            content,
            order: index,
          })),
        },
      },
      include: {
        hints: true,
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
} 