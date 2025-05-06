import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const question = await prisma.question.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        category: true,
        hints: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { answer, categoryId, hints, isVisible } = body;

    const question = await prisma.question.update({
      where: { id: parseInt(params.id) },
      data: {
        answer,
        categoryId: parseInt(categoryId),
        isVisible,
        hints: {
          deleteMany: {},
          create: hints.map((content: string, index: number) => ({
            content,
            order: index,
          })),
        },
      },
      include: {
        category: true,
        hints: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.question.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
} 