import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { Record, Config, type BreadcrumbItem } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { config } from 'process';
import { useEffect } from 'react';
import { useStore } from 'zustand';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Registros',
        href: '/records',
    },
    {
        title: 'Crear',
        href: "",
    },
];

export default function RecordsCreate() {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        title: '',
        description: '',
        latitude: null as number | null,
        longitude: null as number | null,
    });

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
    if (!validate()) return;

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setData('latitude', position.coords.latitude);
                setData('longitude', position.coords.longitude);

                // Espera para asegurarte de que se actualiza el estado antes del post
                setTimeout(() => {
                    post('/records');
                }, 1000);
            },
            (error) => {
                console.error("Error obteniendo ubicación:", error);
                // Si quieres enviar sin ubicación en caso de error:
                post('/records');
            }
        );
    } else {
        console.warn("Geolocalización no está disponible.");
        post('/records');
    }
};
    
    
    useEffect(() => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log("Lat:", position.coords.latitude);
              console.log("Lng:", position.coords.longitude);
              setData('latitude', position.coords.latitude);
              setData('longitude', position.coords.longitude);
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
            <Head title="Registros" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Nuevo registro</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="title">Título</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                            />
                            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                        </div>
                        <div>
                            <Label htmlFor="description">Descripción</Label>
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

