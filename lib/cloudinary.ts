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
      // Her bir dönüşüm parametresini ayrı ayrı ekle
      options.transformation.forEach((transform, index) => {
        Object.entries(transform).forEach(([key, value]) => {
          formData.append(`transformation[${index}][${key}]`, value.toString());
        });
      });
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
      throw new Error(`Cloudinary upload failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    if (!data.secure_url) {
      throw new Error('Cloudinary upload response does not contain secure_url');
    }

    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    if (error instanceof Error) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
    throw new Error('Cloudinary upload failed: Unknown error');
  }
} 