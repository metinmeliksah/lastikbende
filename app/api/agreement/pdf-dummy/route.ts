import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('Agreement PDF API is available. Use POST method to generate PDFs.', { 
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  });
}

export async function POST(request: NextRequest) {
  try {
    return new NextResponse(JSON.stringify({ message: 'Agreement PDF API placeholder' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse(JSON.stringify({ error: 'An error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 