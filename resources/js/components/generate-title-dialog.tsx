import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogFooter, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Trash } from "lucide-react";
import { router } from "@inertiajs/react";
import { Record } from "@/types";

export default function GenerateTitleDialog({ record }: { record: Record }) {

    const handleGenerateTitle = () => {
        router.post(route('imageprocessing.generate-title',
        { id: record.image.id }))
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="secondary" className="cursor-pointer">
                    <Sparkles className="h-5 w-5 cursor-pointer text-yellow-500" />
                    Generar título
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Generar título</DialogTitle>
                    <DialogDescription>
                        ¿Seguro que quieres generar el título?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row justify-between">
                    <DialogClose asChild>
                        <Button variant="secondary" className='cursor-pointer'>Cancel</Button>
                    </DialogClose>
                    <Button className='cursor-pointer' onClick={handleGenerateTitle}>
                        <Sparkles className="h-5 w-5 cursor-pointer text-yellow-500" />
                        Generar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}