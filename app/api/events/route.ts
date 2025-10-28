import {NextRequest, NextResponse} from "next/server";
import connectDB from "@/lib/mongodb";
import Event from '@/database/event.model'

/**
 * Handle POST requests to create a new Event from submitted form data.
 *
 * Attempts to connect to the database, parse the request's form data into an object,
 * create an Event document, and return a JSON response describing the outcome.
 *
 * @param req - The incoming NextRequest whose form data contains the event fields
 * @returns A NextResponse containing one of:
 * - A success JSON with `message: 'Event created successfully.'` and the created `event` with status 201.
 * - A JSON with `message: 'Invalid json body format.'` and status 400 if form data cannot be converted to an object.
 * - A JSON with `message: 'Event Creation failed.'` and an `error` string describing the failure for other errors.
 */
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const formData = await req.formData();

        let event;

        try {
            event = Object.fromEntries(formData.entries());
        } catch (e) {
            return NextResponse.json({message: 'Invalid json body format.'}, {status: 400})
        }

        const createdEvent = await Event.create(event);

        return NextResponse.json({message: 'Event created successfully.', event: createdEvent}, {status: 201});

    } catch (e) {
        console.log(e)
        return NextResponse.json({
            message: 'Event Creation failed.',
            error: e instanceof Error ? e.message : 'Unknown Error'
        })

    }
}