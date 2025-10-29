'use server';

import Event from "@/database/event.model"
import connectDB from "@/lib/mongodb";

export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectDB();

        const event = await Event.findOne({slug});

        // @ts-ignore
        return await Event.find({_id: {$ne: event._id}, tags: {$in: event.tags} }).lean();
    } catch (e) {
        return [];
    }
}

