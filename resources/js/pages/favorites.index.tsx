import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { type BreadcrumbItem, Favorite } from '@/types';
import { use, useEffect, useRef, useState } from 'react';
import { useHasMouse } from '@/hooks/useHasMouse';
import { Badge } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Favoritos',
    href: '/favorites',
  },
];

export default function Favorites({ favorites }: { favorites: Favorite[] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newFavTitle, setNewFavTitle] = useState("");
  const hasMouse = useHasMouse();

  const handleFavClick = (fav: Favorite) => {
    if (isEditing) {
      // En modo edición, borramos favorito
      router.delete(route('favorites.destroy', fav.title));
    } else {
      if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
              (position) => {  
                router.post(route('records.store'), {
                  title: fav.title,
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
                });
              },
              (error) => {
                  router.post(route('records.store'), {
                    title: fav.title,
                  });
              }
          );
      } else {
          console.warn("Geolocalización no está disponible.");
          router.post(route('records.store'), {
            title: fav.title,
          });
      }

    }
  };

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
  const isEditingStyle = () => {
      return isEditing ? "bg-red-200  hover:bg-red-300 " : ""
  }
  const handleAddFavorite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFavTitle.trim()) return;
    router.post(route('favorites.store'), { title: newFavTitle.trim() });
    setNewFavTitle("");
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) return;
    setNewFavTitle("");
    inputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEditing(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditing]);


  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Favoritos" />
      
      <div className="m-4 flex items-center flex-wrap gap-4">
        <Button className="bg-secondary text-secondary-foreground cursor-pointer hover:bg-secondary/80" onClick={()=>setIsEditing(!isEditing)}>
          {isEditing ? "Salir del modo edición" : "Editar favoritos"}
        </Button>
        
        {isEditing && (
          <form onSubmit={handleAddFavorite} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Nuevo favorito..."
              className="border rounded px-2 py-1"
              value={newFavTitle}
              maxLength={50}
              onChange={e => setNewFavTitle(e.target.value)}
            />
            <Button type="submit" className="cursor-pointer" >Añadir</Button>
          </form>
        )}
      </div>
      <div className="m-4 flex items-center gap-4">
        {favorites.length > 0 ? (
          <div className="flex flex-wrap flex-row gap-4">
            {favorites.sort((a, b) => a.title.localeCompare(b.title)).map((fav) => (
              <Button
                key={fav.id}
                variant="outline"
                onClick={() => handleFavClick(fav)}
                className={`${isEditingStyle()} cursor-pointer h-[50px] px-4 text-center`}
              >{fav.title}
              </Button>
            ))}
          </div>
        ) : (
          <Card className="m-4">
            <CardContent>No tienes favoritos aún.</CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
