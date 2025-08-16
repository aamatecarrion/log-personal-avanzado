import {
    Dialog, DialogContent, DialogHeader, DialogTrigger,
    DialogFooter, DialogClose, DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { router } from "@inertiajs/react";
import { ImageProcessingJob } from "@/types";

export default function CancelJobDialog({job}: { job: ImageProcessingJob }) {

    const handleCancelProcessing = ( job_id: number) => {
        router.put(route('imageprocessing.cancel-job', { id: job_id }));
    };

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="secondary" className="cursor-pointer">
                        Cancel job                    
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>Cancel job</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to cancel this job?
                    </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex justify-between">
                    <DialogClose asChild>
                        <Button variant="secondary" className='cursor-pointer'>Cancelar</Button>
                    </DialogClose>
                    <Button className='cursor-pointer' onClick={() => handleCancelProcessing(job.id)}>
                        Cancel Job
                    </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
