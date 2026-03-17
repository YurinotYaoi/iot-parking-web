import { db } from '@/lib/firebase';
import { NextResponse } from 'next/server';

// GET all slots
export async function GET() {
  const snapshot = await db.ref('slots').once('value');
  return NextResponse.json(snapshot.val());
}