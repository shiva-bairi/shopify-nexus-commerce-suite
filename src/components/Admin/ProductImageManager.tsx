
import { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Star, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProductImageManagerProps {
  productId: string;
  productName: string;
}

const ProductImageManager = ({ productId, productName }: ProductImageManagerProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get product images
  const { data: images = [], isLoading } = useQuery({
    queryKey: ['product-images', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching product images:', error);
        throw error;
      }
      
      return data;
    }
  });

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploading(true);
      
      try {
        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${productId}/${Date.now()}.${fileExt}`;
        
        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);
        
        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
        
        // Save image record to database
        const { data: imageRecord, error: dbError } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            image_url: publicUrl,
            is_primary: images.length === 0 // First image is primary
          })
          .select()
          .single();
        
        if (dbError) {
          // Clean up uploaded file if database insert fails
          await supabase.storage
            .from('product-images')
            .remove([fileName]);
          throw new Error(`Database error: ${dbError.message}`);
        }
        
        return imageRecord;
      } finally {
        setUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-images', productId] });
      toast({
        title: "Image uploaded",
        description: "Product image has been uploaded successfully.",
      });
    },
    onError: (error: Error) => {
      console.error('Image upload failed:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const image = images.find(img => img.id === imageId);
      if (!image) throw new Error('Image not found');
      
      // Delete from database first
      const { error: dbError } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);
      
      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }
      
      // Extract filename from URL and delete from storage
      try {
        const urlParts = image.image_url.split('/');
        const fileName = urlParts.slice(-2).join('/'); // Get productId/filename.ext
        await supabase.storage
          .from('product-images')
          .remove([fileName]);
      } catch (storageError) {
        console.warn('Failed to delete file from storage:', storageError);
        // Don't throw error for storage cleanup failure
      }
      
      return imageId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-images', productId] });
      toast({
        title: "Image deleted",
        description: "Product image has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      console.error('Image deletion failed:', error);
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Set primary image mutation
  const setPrimaryMutation = useMutation({
    mutationFn: async (imageId: string) => {
      // First, unset all primary flags for this product
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId);
      
      // Then set the selected image as primary
      const { error } = await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', imageId);
      
      if (error) {
        throw new Error(`Failed to set primary image: ${error.message}`);
      }
      
      return imageId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-images', productId] });
      toast({
        title: "Primary image updated",
        description: "Primary product image has been updated.",
      });
    },
    onError: (error: Error) => {
      console.error('Set primary failed:', error);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }
    
    uploadImageMutation.mutate(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading images...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Product Images</h3>
          <Button onClick={handleUploadClick} disabled={uploading} size="sm">
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </>
            )}
          </Button>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />
        
        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.image_url}
                    alt={`${productName} image`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {image.is_primary && (
                  <Badge className="absolute top-2 left-2">
                    <Star className="h-3 w-3 mr-1" />
                    Primary
                  </Badge>
                )}
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteImageMutation.mutate(image.id)}
                    disabled={deleteImageMutation.isPending}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                {!image.is_primary && (
                  <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPrimaryMutation.mutate(image.id)}
                      disabled={setPrimaryMutation.isPending}
                    >
                      <Star className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No images uploaded for this product</p>
            <Button onClick={handleUploadClick} disabled={uploading}>
              <Upload className="h-4 w-4 mr-2" />
              Upload First Image
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductImageManager;
