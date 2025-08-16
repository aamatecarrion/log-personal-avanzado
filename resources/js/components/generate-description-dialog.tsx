import {
    Dialog, DialogContent, DialogHeader, DialogTrigger,
    DialogFooter, DialogClose, DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { router } from "@inertiajs/react";

export default function GenerateDescriptionDialog({ record }: { record: { image: { id: number } } }) {

    const handleRegenerateDescription = () => {
        router.post(route('imageprocessing.generate-description',
        { id: record.image.id }))
    };

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="secondary" className="cursor-pointer">
                    <Sparkles className="h-5 w-5 cursor-pointer text-yellow-500" />
                    Generar descripción
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>Generar descripción</DialogTitle>
                    <DialogDescription>
                        ¿Seguro que quieres generar una descripción?
                    </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex justify-between">
                    <DialogClose asChild>
                        <Button variant="secondary" className='cursor-pointer'>Cancelar</Button>
                    </DialogClose>
                    <Button className='cursor-pointer' onClick={handleRegenerateDescription}>
                        <Sparkles className="h-5 w-5 cursor-pointer text-yellow-500" />
                        Generar
                    </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
