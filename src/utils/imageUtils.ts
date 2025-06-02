// Utility functions for handling image files in payments

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export interface ProcessedImage {
  base64: string;
  fileName: string;
  fileSize: number;
  originalSize: number;
  compressed: boolean;
}

/**
 * Convert file to base64 string
 */
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Validate image file type and size
 */
export const validateImageFile = (file: File): ImageValidationResult => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
  const maxSizeInMB = 5;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no permitido. Solo se permiten: JPG, PNG, GIF, PDF'
    };
  }

  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      error: `El archivo es demasiado grande. Máximo permitido: ${maxSizeInMB}MB`
    };
  }

  return { valid: true };
};

/**
 * Compress image if it's too large
 */
export const compressImage = (base64: string, maxSizeKB: number = 500): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(base64);
        return;
      }

      // Calculate new dimensions to maintain aspect ratio
      const maxWidth = 1200;
      const maxHeight = 1200;
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      // Start with high quality and reduce if needed
      let quality = 0.9;
      let compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      
      // Reduce quality until size is acceptable
      while (compressedBase64.length > maxSizeKB * 1024 && quality > 0.1) {
        quality -= 0.1;
        compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      }
      
      resolve(compressedBase64);
    };
    
    img.src = base64;
  });
};

/**
 * Generate thumbnail from base64 image
 */
export const generateThumbnail = (base64: string, size: number = 150): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(base64);
        return;
      }

      canvas.width = size;
      canvas.height = size;

      // Calculate crop area to maintain square aspect ratio
      const minDimension = Math.min(img.width, img.height);
      const startX = (img.width - minDimension) / 2;
      const startY = (img.height - minDimension) / 2;

      ctx.drawImage(
        img,
        startX, startY, minDimension, minDimension,
        0, 0, size, size
      );
      
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    
    img.src = base64;
  });
};

/**
 * Get file size from base64 string
 */
export const getBase64Size = (base64: string): number => {
  // Remove data URL prefix to get pure base64
  const base64Data = base64.split(',')[1] || base64;
  
  // Calculate size (base64 is ~33% larger than original)
  const sizeInBytes = (base64Data.length * 3) / 4;
  
  // Account for padding
  const padding = base64Data.match(/=/g)?.length || 0;
  return sizeInBytes - padding;
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Check if string is a valid base64 image
 */
export const isValidBase64Image = (str: string): boolean => {
  if (!str || typeof str !== 'string') return false;
  
  // Check if it's a data URL
  if (str.startsWith('data:image/')) {
    try {
      const base64Part = str.split(',')[1];
      return base64Part ? /^[A-Za-z0-9+/]*={0,2}$/.test(base64Part) : false;
    } catch {
      return false;
    }
  }
  
  return false;
};

/**
 * Process image file for storage
 */
export const processImageFile = async (file: File): Promise<ProcessedImage> => {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Convert to base64
  const originalBase64 = await convertFileToBase64(file);
  const originalSize = file.size;

  // Compress if needed (for files larger than 500KB)
  let finalBase64 = originalBase64;
  let compressed = false;

  if (originalSize > 500 * 1024) {
    finalBase64 = await compressImage(originalBase64);
    compressed = true;
  }

  const finalSize = getBase64Size(finalBase64);

  return {
    base64: finalBase64,
    fileName: file.name,
    fileSize: finalSize,
    originalSize,
    compressed
  };
};

/**
 * Create downloadable blob from base64
 */
export const downloadBase64Image = (base64: string, fileName: string): void => {
  try {
    // Convert base64 to blob
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'voucher.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading image:', error);
    alert('Error al descargar la imagen');
  }
};

/**
 * Convert PDF to image (placeholder for future implementation)
 */
export const convertPdfToImage = async (file: File): Promise<string> => {
  // For now, return a placeholder
  // In a real implementation, you'd use PDF.js or similar
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFyY2hpdm8gUERGPC90ZXh0Pjwvc3ZnPg==';
};

export default {
  convertFileToBase64,
  validateImageFile,
  compressImage,
  generateThumbnail,
  getBase64Size,
  formatFileSize,
  isValidBase64Image,
  processImageFile,
  downloadBase64Image,
  convertPdfToImage
};