import { supabase } from '../config/supabase.js'

export async function uploadGameCover(buffer: Buffer, filename: string): Promise<string> {
  const { error } = await supabase.storage
    .from('game-covers')
    .upload(filename, buffer, {
      contentType: 'image/jpeg', // fallback, multer gives us the real mime
      upsert: false
    })

  if (error) {
    console.error('Supabase upload error:', error)
    throw new Error('Failed to upload image to storage')
  }

  const { data: publicUrlData } = supabase.storage
    .from('game-covers')
    .getPublicUrl(filename)

  return publicUrlData.publicUrl
}
