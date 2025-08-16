import {
    Dialog, DialogContent, DialogHeader, DialogTrigger,
    DialogFooter, DialogClose, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { router } from "@inertiajs/react";

export default function CancelAllDialog() {
    const [open, setOpen] = useState(false);

    function handleProcessFailed() {
        setOpen(false);
        router.put(route('imageprocessing.cancel-all'));
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" className="cursor-pointer">
                    Cancel all jobs
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>This action will set all pending and processing jobs to cancelled</DialogTitle>
                </DialogHeader>
                <DialogFooter className="flex flex-row justify-between">
                    <DialogClose asChild>
                        <Button variant="secondary" className='cursor-pointer'>Hell nah...</Button>
                    </DialogClose>
                    <Button className='cursor-pointer' onClick={handleProcessFailed}>
                        Hell yeah 🤘
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
