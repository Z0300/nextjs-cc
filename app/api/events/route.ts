import {NextRequest, NextResponse} from "next/server";
import connectDB from "@/lib/mongodb";
import Event from '@/database/event.model'
import {v2 as cloudinary} from 'cloudinary'

/**
 * Create a new event by parsing multipart/form-data, uploading the provided image to Cloudinary, and saving the event to the database.
 *
 * Accepts form fields representing the event's properties plus:
 * - `image`: required file to upload
 * - `tags`: JSON string array of tag values
 * - `agenda`: JSON string representing the event agenda
 *
 * @param req - NextRequest containing multipart/form-data with the event fields described above
 * @returns On success, a JSON body with `message: 'Event created successfully.'` and the created event object (status 201). Returns status 400 with an error message for invalid form JSON or missing image. On other failures returns a JSON body with `message: 'Event Creation failed.'` and an `error` string describing the failure.
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

        const file = formData.get('image') as File;

        if (!file) return NextResponse.json({message: 'Image file is required.'}, {status: 400});

        let tags = JSON.parse(formData.get('tags') as string)
        let agenda = JSON.parse(formData.get('agenda') as string)

        const arrBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({resource_type: 'image', folder: 'DevEvents'}, (error, result) => {
                if (error) return reject(error);
                resolve(result)
            }).end(buffer)
        })

        event.image = (uploadResult as { secure_url: string }).secure_url;

        const createdEvent = await Event.create({
            ...event,
            tags: tags,
            agenda: agenda
        });

        return NextResponse.json({message: 'Event created successfully.', event: createdEvent}, {status: 201});

    } catch (e) {
        console.log(e)
        return NextResponse.json({
            message: 'Event Creation failed.',
            error: e instanceof Error ? e.message : 'Unknown Error'
        })

    }
}

export async function GET() {
    try {
        await connectDB();

        const events = await Event.find().sort({createdAt: -1});

        return NextResponse.json({message: 'Event list successfully.', events}, {status: 200});
    } catch (e) {
        return NextResponse.json({message: 'Event fetching failed', error: e}, {status: 500})
    }
}
