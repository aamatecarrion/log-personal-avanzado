import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { type BreadcrumbItem, Favorite } from '@/types';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Favoritos',
    href: '/favorites',
  },
];

export default function Favorites({ favorites }: { favorites: Favorite[] }) {
  const [isEditing, setIsEditing] = useState(false);

  const handleFavClick = (e : any) => {
    if (isEditing) {
      router.delete(route('favorites.destroy', e.target.innerText));
    }
    router.post(route('records.store'), {
      title: e.target.innerText,
    });
  }
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Favoritos" />
      
      {favorites.length > 0 ? (
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {favorites.map((fav) => (
            <Button
              onClick={handleFavClick}
              key={fav.id}
              variant="outline"
              className="cursor-pointer rounded-full h-[100px] w-[100px] flex items-center justify-center text-center text-sm p-2 overflow-hidden"
            >
              <span className="truncate">{fav.title}</span>
            </Button>
          ))}

          {/* Botón para añadir favorito */}
        </div>
      ) : (
        <Card className="m-4">
          <CardContent>No tienes favoritos aún.</CardContent>
        </Card>
      )}
      
    </AppLayout>
  );
}
