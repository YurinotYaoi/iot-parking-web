import { NextResponse } from 'next/server';

export const successResponse = (data, status = 200) =>
  NextResponse.json({ success: true, data }, { status });

export const errorResponse = (message, status = 400) =>
  NextResponse.json({ success: false, error: message }, { status });