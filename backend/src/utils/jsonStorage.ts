import { promises as fs } from 'fs'
import { join } from 'path'

export async function readJson<T>(filePath: string): Promise<T> {
  try {
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data) as T
  } catch {
    return [] as unknown as T
  }
}

export async function writeJson<T>(filePath: string, data: T): Promise<void> {
  const dir = filePath.substring(0, filePath.lastIndexOf('/'))
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}
