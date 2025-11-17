import { NextResponse } from 'next/server'
import { checkDatabaseConnection } from '@/lib/db'

export async function GET() {
  const db = await checkDatabaseConnection()
  return NextResponse.json({ status: 'ok', db }, { status: 200 })
}