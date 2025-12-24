import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/database/event.model";
import { v2 as cloudinary } from 'cloudinary';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const formData = await req.formData();

        let event;

        try {
            event = Object.fromEntries(formData.entries());
        } catch (e) {
            return NextResponse.json({ message: 'Invalid form data' }, { status: 400 });
        }

        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json({ message: 'Image file is required' }, { status: 400 });
        }
        const tags = JSON.parse(formData.get('tags') as string);
        const agenda = JSON.parse(formData.get('agenda') as string);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise(((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                resource_type: 'image',
                folder: 'DevEvent',
            }, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }).end(buffer);
        }))

        event.image = (uploadResult as { secure_url: string }).secure_url;

        const createdEvent = await Event.create({
            ...event,
            tags: tags,
            agenda: agenda,

        });

        return NextResponse.json({ message: 'Event Created Successfully', event: createdEvent }, { status: 201 })
    } catch (e) {
        console.error(e)
        return NextResponse.json({ message: 'Event Creation FFailed', error: e instanceof Error ? e.message : 'Unknown error' }, { status: 400 })
    }
}


export async function GET() {
    try {
        await dbConnect();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({ message: 'Events fetced succesful', events }, { status: 200 })
    } catch (e) {
        return NextResponse.json({ message: 'Failed to fetch events', error: e }, { status: 500 })
    }
}