import { type NextRequest, NextResponse } from 'next/server'
import * as fal from '@fal-ai/serverless-client'

fal.config({
  credentials: process.env.FAL_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, image_urls } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const hasReferenceImages = image_urls && image_urls.length > 0

    // Use edit endpoint when reference images are provided, otherwise text-to-image
    const model = hasReferenceImages
      ? 'fal-ai/nano-banana/edit'
      : 'fal-ai/nano-banana'

    const input: Record<string, unknown> = {
      prompt,
      num_images: 1,
      aspect_ratio: '1:1',
      output_format: 'png',
    }

    if (hasReferenceImages) {
      input.image_urls = image_urls
    }

    const result = (await fal.subscribe(model, { input })) as {
      images?: { url: string }[]
    }

    const imageUrl = result.images?.[0]?.url

    if (!imageUrl) {
      throw new Error('No image generated')
    }

    // Fetch the image from fal and convert to base64 data URL
    // so the browser can display it without CORS issues
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch generated image')
    }
    const imageBuffer = await imageResponse.arrayBuffer()
    const base64 = Buffer.from(imageBuffer).toString('base64')
    const contentType = imageResponse.headers.get('content-type') || 'image/png'
    const dataUrl = `data:${contentType};base64,${base64}`

    return NextResponse.json({ imageUrl: dataUrl })
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 },
    )
  }
}
