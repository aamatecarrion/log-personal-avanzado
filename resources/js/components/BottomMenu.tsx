import { useEffect, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Images,  Map, Cpu, ImagePlus, Logs } from "lucide-react";
import ScrollTopButton from "./ScrollTopButton";

const bottomNavItems = [
    { title: "Mapa", href: "/map", icon: Map },
    { title: "Jobs", href: "/image-processing", icon: Cpu },
    { title: "Registros", href: "/records", icon: Logs},
    { title: "Imágenes", href: "/images", icon: Images },
    { title: "Subir", href: "/images/create", icon: ImagePlus },
];

export default function BottomMenu({ children }: { children?: React.ReactNode }) {
  const page = usePage();
  const [visible, setVisible] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const threshold = 10;

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll < 10 ) {
        setVisible(true); // siempre visible arriba del todo
      } else if (currentScroll > lastScroll) {
        setVisible(false); // scroll hacia abajo
      } else if (currentScroll < lastScroll - threshold) {
        setVisible(true); // scroll hacia arriba
      }

      setLastScroll(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  return (
    <div
      className={`fixed bottom-0 left-0 w-full bg-white border-t shadow-md transition-transform duration-300 md:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex justify-around py-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = page.url === item.href;
          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex flex-col items-center text-sm ${
                isActive ? "text-blue-600" : "text-gray-700"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>
      <ScrollTopButton />
    </div>
  );
}
