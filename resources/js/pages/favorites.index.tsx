import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { type BreadcrumbItem, Favorite } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { useHasMouse } from '@/hooks/useHasMouse';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Favoritos', href: '/favorites' }];

export default function Favorites({ favorites }: { favorites: Favorite[] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newFavTitle, setNewFavTitle] = useState("");
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const hasMouse = useHasMouse();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFavClick = async (fav: Favorite) => {
    if (isEditing) {
      router.delete(route('favorites.destroy', fav.title));
      return;
    }

    setLoadingId(fav.id);

    try {
      const position = await getCurrentPosition({ timeout: 30000 });
      router.post(route('records.store'), {
        title: fav.title,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (error) {
      router.post(route('records.store'), { title: fav.title });
    } finally {
      setLoadingId(null);
    }
  };

  const getCurrentPosition = (options?: PositionOptions): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) return reject("No geolocation");

      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  };

  const handleAddFavorite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFavTitle.trim()) return;
    router.post(route('favorites.store'), { title: newFavTitle.trim() });
    setNewFavTitle("");
  };

  useEffect(() => {
    if (!isEditing) return;
    setNewFavTitle("");
    inputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsEditing(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Favoritos" />

      <div className="m-4 flex items-center flex-wrap gap-4">
        <Button
          className="bg-secondary text-secondary-foreground cursor-pointer hover:bg-secondary/80"
          onClick={() => setIsEditing(!isEditing)}
        >
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
            <Button type="submit" className="cursor-pointer">Añadir</Button>
          </form>
        )}
      </div>

      <div className="m-4 flex items-center gap-4">
        {favorites.length > 0 ? (
          <div className="flex flex-wrap flex-row gap-4">
            {favorites
              .sort((a, b) => a.title.localeCompare(b.title))
              .map(fav => (
                <Button
                  key={fav.id}
                  variant="outline"
                  onClick={() => handleFavClick(fav)}
                  disabled={loadingId === fav.id}
                  className={`${isEditing ? "bg-red-200 hover:bg-red-300" : ""} cursor-pointer h-[50px] px-4 text-center`}
                >
                  {loadingId === fav.id ? "Cargando..." : fav.title}
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
