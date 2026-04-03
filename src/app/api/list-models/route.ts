import { NextResponse } from "next/server";

export async function GET() {
    const apiKey = "AIzaSyCZuemtU3j-vWnYNlcSHNFVEh0GBLC0xvM";

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
        );

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}