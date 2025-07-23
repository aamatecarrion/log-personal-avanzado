import {
    Dialog, DialogContent, DialogHeader, DialogTrigger,
    DialogFooter, DialogClose, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { router } from "@inertiajs/react";

export default function ProcessFailedDialog() {
    const [refreshing, setRefreshing] = useState(false);
    const [open, setOpen] = useState(false);

    function handleProcessFailed() {
        setOpen(false);
        router.post(route('imageprocessing.process-all-failed'));
        
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" className="cursor-pointer">
                    <RefreshCw className={`h-4 w-4 mr-2 transition-transform ${refreshing ? "animate-spin" : ""}`} />
                    Process failed jobs
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Run uncompleted jobs?</DialogTitle>
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
