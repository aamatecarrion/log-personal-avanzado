import { RecordsTable } from '@/components/records-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { useRecordsStore } from '@/store/recordsStore';
import { Record, Config, type BreadcrumbItem } from '@/types';
import { Textarea } from '@headlessui/react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { config } from 'process';
import { ChangeEvent, useEffect } from 'react';
import { useStore } from 'zustand';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Images',
        href: '/images',
    },
    {
        title: 'Upload',
        href: "",
    },
];

export default function ImagesUpload() {
    const { data, setData, post, progress, errors } = useForm({
        images: [] as File[],
      })

      const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
          setData('images', Array.from(e.target.files))
        }
      }

      const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('api.images.store'), {
          forceFormData: true,
          onSuccess: () => {
            setData({
              images: [],
            });
          }
        })
      }


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Records" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Upload</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <form onSubmit={submit}>
                        <input type="file" multiple accept="image/*" onChange={handleFileChange} />
                        {errors.images && <div>{errors.images}</div>}
                        <button type="submit">Subir imágenes</button>
                        {progress && <progress value={progress.percentage} max="100">{progress.percentage}%</progress>}
                    </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

