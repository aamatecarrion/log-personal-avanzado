import { useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import { ArrowUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const ScrollTopButton = () => {
    const [isAtTop, setIsAtTop] = useState(true);
    const timeoutRef = useRef<number | null>(null);
    const longPressTriggered = useRef(false);

    useEffect(() => {
        const onScroll = () => {
        setIsAtTop(window.scrollY <= 10);
        };
        onScroll();
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handlePointerDown = () => {
        if (!isAtTop) return;
        longPressTriggered.current = false;
        timeoutRef.current = window.setTimeout(() => {
            longPressTriggered.current = true;
            if (navigator.vibrate) navigator.vibrate(200);
            router.visit("/favorites");
        }, 600);
    };

    const handleClick = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (!isAtTop) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (!longPressTriggered.current) {
            router.visit("/records/create");
        }
    };

    return (
        <Button
            onClick={handleClick}
            onPointerDown={handlePointerDown}
            className="cursor-pointer fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 p-0 shadow-xl bg-primary text-white hover:bg-primary/90 transition"
            title={isAtTop ? "Nuevo registro o favoritos" : "Subir arriba"}
        >
        {isAtTop ? (
            <Plus className="!w-8 !h-8" />
        ) : (
            <ArrowUp className="!w-8 !h-8" />
        )}
        </Button>
    );
};

export default ScrollTopButton;
