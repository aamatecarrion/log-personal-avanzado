import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Data', href: '/admin/data' },
];

export default function DataPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = () => {
    window.location.href = '/admin/data/export';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const uploadFile = (file: File) => {
    const formData = new FormData();
    formData.append('archivo_zip', file);

    router.post('/admin/data/import', formData, {
      forceFormData: true,
      onSuccess: () => setMessage('Importación exitosa'),
      onError: () => setMessage('Error al importar'),
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Data" />
      <div className="m-4 flex flex-col gap-6">
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Exportar datos
        </button>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
            dragging ? 'border-blue-600 bg-blue-50' : 'border-gray-400'
          }`}
        >
          <p className="text-gray-600">Haz clic o arrastra un archivo ZIP aquí para importar</p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={handleFileChange}
        />

        {message && <p className="text-green-700">{message}</p>}
      </div>
    </AppLayout>
  );
}
