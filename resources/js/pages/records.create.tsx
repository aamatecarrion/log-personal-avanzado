import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { Record, Config, type BreadcrumbItem } from '@/types';
import { Textarea } from '@headlessui/react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { config } from 'process';
import { useEffect } from 'react';
import { useStore } from 'zustand';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Records',
        href: '/records',
    },
    {
        title: 'Create',
        href: "",
    },
];

export default function RecordsCreate() {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        title: '',
        description: '',
    })

    const validate = () => {
        let valid = true;
        clearErrors();
        
        if (!data.title) {
            errors.title = 'Title is required';
            valid = false;
        }

        return valid;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            post('/records');
        }
    }
    
    
    useEffect(() => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log("Lat:", position.coords.latitude);
              console.log("Lng:", position.coords.longitude);
            },
            (error) => {
              console.error("Error obteniendo ubicación:", error);
            }
          );
        } else {
          console.warn("Geolocalización no está disponible en este navegador.");
        }
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Records" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>New Record</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                            />
                            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea className={"w-full border border-gray-300 rounded-md p-2 focus:outline-none"}
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                        </div>
                        <Button type="submit" disabled={processing}>
                            Crear
                        </Button>
                    </form>                       
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

