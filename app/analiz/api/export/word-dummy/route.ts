import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('Word export API is available.', { 
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  });
}

export async function POST(request: NextRequest) {
  try {
    return new NextResponse(JSON.stringify({ message: 'Word export API placeholder' }), {
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