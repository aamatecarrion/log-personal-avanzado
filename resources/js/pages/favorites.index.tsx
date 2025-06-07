import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem, Favorite } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Favoritos',
    href: '/favorites',
  },
];

export default function Favorites({ favorites }: { favorites: Favorite[] }) {

    
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Favoritos" />
      
      {favorites.length > 0 ? (
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {favorites.map((fav) => (
            <Button key={fav.id} variant="outline" className="truncate">
              {fav.title}
            </Button>
          ))}

          {/* Botón para añadir favorito */}
          <Button variant="default" className="flex items-center justify-center text-2xl font-bold">
            +
          </Button>
        </div>
      ) : (
        <Card className="m-4">
          <CardContent>No tienes favoritos aún.</CardContent>
          <Button variant="default" className="mt-4 w-full text-center text-2xl font-bold">
            +
          </Button>
        </Card>
      )}
    </AppLayout>
  );
}
