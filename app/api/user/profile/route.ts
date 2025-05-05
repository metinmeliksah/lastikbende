import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Cloudinary'den eski fotoğrafı sil
async function deleteCloudinaryImage(imageUrl: string) {
  try {
    // Cloudinary URL'inden public_id'yi çıkar
    const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
    
    // Cloudinary API'sine silme isteği gönder
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
          api_key: process.env.CLOUDINARY_API_KEY,
          timestamp: Math.floor(Date.now() / 1000),
          signature: process.env.CLOUDINARY_API_SECRET, // Bu güvenli değil, gerçek uygulamada signature oluşturulmalı
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete image from Cloudinary');
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    // Hata durumunda sessizce devam et
  }
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('id', user.id)
      .single();

    if (preferencesError) {
      return NextResponse.json({ error: preferencesError.message }, { status: 400 });
    }

    return NextResponse.json({
      profile,
      preferences
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profile, preferences } = await request.json();

    // Eski fotoğraf varsa ve yeni fotoğraf yüklendiyse, eski fotoğrafı sil
    if (profile.oldProfileImageUrl && profile.profileImageUrl !== profile.oldProfileImageUrl) {
      await deleteCloudinaryImage(profile.oldProfileImageUrl);
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        ...profile,
        profile_image_url: profile.profileImageUrl || profile.profile_image_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    const { error: preferencesError } = await supabase
      .from('user_preferences')
      .update(preferences)
      .eq('id', user.id);

    if (preferencesError) {
      return NextResponse.json({ error: preferencesError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 