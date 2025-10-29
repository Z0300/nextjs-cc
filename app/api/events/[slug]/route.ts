import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Event } from '@/database';

// Type for route params in Next.js App Router
interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/events/[slug]
 * Fetches a single event by its slug
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Await params as required in Next.js 15+
    const { slug } = await params;

    // Validate slug parameter
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing slug parameter' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Query event by slug
    const event = await Event.findOne({ slug: slug.trim().toLowerCase() });

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        { success: false, error: `Event with slug "${slug}" not found` },
        { status: 404 }
      );
    }

    // Return successful response with event data
    return NextResponse.json(
      {
        success: true,
        data: event,
      },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging (use proper logging service in production)
    console.error('Error fetching event by slug:', error);

    // Handle unexpected errors
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred while fetching the event',
      },
      { status: 500 }
    );
  }
}
