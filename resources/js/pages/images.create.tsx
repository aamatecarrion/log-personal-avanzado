import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import type { BreadcrumbItem } from '@/types';
import { UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Images', href: '/images' },
  { title: 'Upload', href: '' },
];

export default function ImagesUpload() {
  const { data, setData, post, progress, errors } = useForm({
    images: [] as File[],
  });

  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter((file) => file.type.startsWith('image/'));
    const newPreviews = validFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    const updated = [...previews, ...newPreviews];
    setPreviews(updated);
    setData('images', updated.map((p) => p.file));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const removeImage = (index: number) => {
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    setData('images', updated.map((p) => p.file));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('images.store'), {
      forceFormData: true,
      showProgress: false,
      onSuccess: () => {
        setData({ images: [] });
        setPreviews([]);
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Upload Images" />
      <div className="flex flex-col gap-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Subir imágenes</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">

              {/* Zona de drop/click */}
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`w-full cursor-pointer rounded-lg border-2 p-6 text-center transition 
                  ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-dashed border-gray-300 hover:bg-gray-100'}`}
              >
                <UploadCloud className="mx-auto mb-2 h-8 w-8 text-gray-500" />
                <p className="text-sm text-gray-600">Haz clic o arrastra imágenes aquí</p>
                <p className="text-xs text-gray-400">(Se permiten múltiples imágenes)</p>
              </div>

              <input
                type="file"
                ref={inputRef}
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />

              {errors.images && <div className="text-red-500">{errors.images}</div>}

              {previews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview.url}
                        alt={`Preview ${index}`}
                        className="w-full h-48 object-cover rounded shadow"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="cursor-pointer absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-150"
                        title="Eliminar"
                      >
                        <X className="h-4 w-4" />
                      </button>

                    </div>
                  ))}
                </div>
              )}

              {previews.length > 0 && (
                <Button
                  type="submit"
                  disabled={!!progress}
                  className="w-full relative overflow-hidden"
                  size="lg"
                  onClick={(e) => {
                    e.preventDefault();
                    submit(e);
                  }}
                >
                  {progress ? (
                    <div
                      className="absolute inset-0 bg-blue-500 transition-all duration-200"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  ) : null}

                  <span className={`relative z-10 ${progress ? 'text-white' : ''}`}>
                    {progress ? `${progress.percentage}%` : 'Subir imágenes'}
                  </span>
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
