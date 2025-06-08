import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogFooter, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { router } from "@inertiajs/react";
import { Record } from "@/types";

export default function DeleteRecordDialog({ record }: { record: Record }) {


    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-secondary cursor-pointer text-secondary-foreground hover:bg-red-500">
                    <Trash className="h-full w-full" />Eliminar
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[50vh] overflow-y-auto bg-zinc-950 text-white shadow-xl border border-red-700">
                <div className="absolute inset-0 z-[-2] bg-black/80" />
                <DialogHeader>
                    <DialogTitle className="text-2xl text-red-600">⚠️ Eliminar registro</DialogTitle>
                    <DialogDescription className="text-white/80">
                        ¿Seguro que quieres eliminar este registro?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row f-end justify-between pt-4">
                    <DialogClose asChild>
                        <Button variant="secondary" className='cursor-pointer'>Cancelar</Button>
                    </DialogClose>
                    <Button variant="destructive" className='cursor-pointer' onClick={() => router.delete(route('records.destroy', record.id))}>⚠️ Eliminar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}