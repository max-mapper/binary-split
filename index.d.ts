import type { Transform } from 'node:stream'

export default function split (splitOn?: string | Uint8Array): Transform
