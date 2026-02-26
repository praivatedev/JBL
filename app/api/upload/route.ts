import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

console.log(process.env.CLOUDINARY_NAME)
console.log(process.env.CLOUDINARY_API_KEY)
console.log(process.env.CLOUDINARY_API_SECRET)

export async function POST (req: Request) {
    const formData = await req.formData()
    const file = formData.get("file") as File

    console.log("File:", file)

    if(!file)
        return NextResponse.json({error: "No file uploaded!!"})

    if(!file.type.startsWith("image/"))
        return NextResponse.json({error: "Only images are allowed!!"})

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    try {
        const result: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "Team logos" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        uploadStream.end(buffer);
    });

        return NextResponse.json(
            {logoUrl: result.secure_url}, 
            {status: 200}
        )
    } catch (error) {
        console.log("Cloudinary error:", error)
        return NextResponse.json(
            {error: "Something went wrong!!!"}, 
            {status:500}
        )
    }


}