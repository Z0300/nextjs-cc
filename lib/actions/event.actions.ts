'use server';

import Event, {IEvent} from "@/database/event.model"
import connectDB from "@/lib/mongodb";

export const getSimilarEventsBySlug = async (slug: string): Promise<IEvent[]> => {
    try {
        await connectDB();

        const event = await Event.findOne({slug}).lean<IEvent>();

        // @ts-ignore
        return await Event.find({_id: {$ne: event._id}, tags: {$in: event.tags}}).lean<IEvent>();
    } catch (e) {
        return [];
    }
}

