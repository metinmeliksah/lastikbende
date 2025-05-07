export async function uploadToCloudinary(
  file: File,
  options: {
    folder?: string;
    transformation?: Array<Record<string, any>>;
  } = {}
): Promise<string> {
  try {
    // Cloudinary yapılandırmasını kontrol et
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary cloud name is not configured');
    }
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
      throw new Error('Cloudinary upload preset is not configured');
    }

    // Dosya boyutu kontrolü (2MB)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('Dosya boyutu 2MB\'dan küçük olmalıdır');
    }

    // Dosya tipi kontrolü
    if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
      throw new Error('Sadece JPG, PNG veya GIF dosyaları yükleyebilirsiniz');
    }

    // FormData oluştur
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);

    // Klasör belirtilmişse ekle
    if (options.folder) {
      formData.append('folder', options.folder);
    }

    // Dönüşüm parametrelerini ekle
    if (options.transformation && options.transformation.length > 0) {
      const transformations = options.transformation.map(transform => {
        const params = [];
        for (const [key, value] of Object.entries(transform)) {
          if (typeof value === 'string' && value.includes('_')) {
            params.push(value);
          } else {
            params.push(`${key}_${value}`);
          }
        }
        return params.join(',');
      });
      
      formData.append('transformation', transformations.join('/'));
    }

    // Yükleme isteği gönder
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary API Error:', errorData);
      throw new Error(errorData.error?.message || 'Fotoğraf yüklenirken bir hata oluştu');
    }

    const data = await response.json();

    if (!data.secure_url) {
      throw new Error('Fotoğraf yüklenirken bir hata oluştu');
    }

    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    if (error instanceof Error) {
      throw new Error(`Fotoğraf yüklenirken bir hata oluştu: ${error.message}`);
    }
    throw new Error('Fotoğraf yüklenirken beklenmeyen bir hata oluştu');
  }
} 