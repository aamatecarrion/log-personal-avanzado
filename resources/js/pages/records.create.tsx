import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Registros', href: '/records' },
  { title: 'Crear', href: '' },
];

export default function RecordsCreate() {
  const { data, setData, post, processing, errors, clearErrors, setError } = useForm({
    title: '',
    description: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const [loadingLocation, setLoadingLocation] = useState(false);

  const getCurrentPosition = (options?: PositionOptions): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) return reject("Geolocalización no disponible");
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  };

  const validate = () => {
    clearErrors();
    if (!data.title.trim()) {
      setError('title', 'El título es obligatorio');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoadingLocation(true);

    try {
      const position = await getCurrentPosition({ timeout: 5000 });
      setData('latitude', position.coords.latitude);
      setData('longitude', position.coords.longitude);
    } catch (error) {
      console.warn("No se pudo obtener ubicación:", error);
      setData('latitude', null);
      setData('longitude', null);
    } finally {
      post('/records');
      setLoadingLocation(false);
    }
  };

  useEffect(() => {
    getCurrentPosition()
      .then((position) => {
        setData('latitude', position.coords.latitude);
        setData('longitude', position.coords.longitude);
        console.log("Ubicación pre-cargada.");
      })
      .catch((err) => {
        console.warn("Ubicación no disponible en efecto:", err);
      });
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
                <Textarea
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none"
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
              </div>

              <Button type="submit" disabled={processing || loadingLocation}>
                {loadingLocation ? 'Obteniendo ubicación...' : 'Crear'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
