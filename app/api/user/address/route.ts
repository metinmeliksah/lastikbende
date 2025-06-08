import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Helper to get user id from Supabase session
async function getUserIdFromRequest(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session?.user?.id) {
      console.error('Auth error:', error);
      return null;
    }
    
    return session.user.id;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// GET: List all addresses for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId);
      
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Add a new address for the authenticated user
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { adres_baslik, adres, sehir, ilce, telefon, adres_tipi } = body;
    
    if (!adres_baslik || !adres || !sehir || !ilce || !telefon || !adres_tipi) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('addresses')
      .insert([{
        user_id: userId,
        adres_baslik,
        adres,
        sehir,
        ilce,
        telefon,
        adres_tipi
      }])
      .select()
      .single();
      
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update an existing address
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { id, adres_baslik, adres, sehir, ilce, telefon, adres_tipi } = body;
    
    if (!id || !adres_baslik || !adres || !sehir || !ilce || !telefon || !adres_tipi) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // First check if the address belongs to the user
    const { data: existingAddress, error: checkError } = await supabase
      .from('addresses')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
      
    if (checkError || !existingAddress) {
      return NextResponse.json(
        { success: false, error: 'Address not found or unauthorized' },
        { status: 404 }
      );
    }
    
    const { data, error } = await supabase
      .from('addresses')
      .update({
        adres_baslik,
        adres,
        sehir,
        ilce,
        telefon,
        adres_tipi
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
      
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete an address
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Address id is required' },
        { status: 400 }
      );
    }
    
    // First check if the address belongs to the user
    const { data: existingAddress, error: checkError } = await supabase
      .from('addresses')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
      
    if (checkError || !existingAddress) {
      return NextResponse.json(
        { success: false, error: 'Address not found or unauthorized' },
        { status: 404 }
      );
    }
    
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
      
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}