import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { User, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Cpu, Folder, ImagePlus, Images, LayoutGrid, Logs, Map, SquarePen, Star, StopCircle, User2, UserRoundCog, UsersRound, WorkflowIcon } from 'lucide-react';
import AppLogo from './app-logo';
import { useEffect } from 'react';

const mainNavItems: NavItem[] = [
    {
        title: 'Nuevo Registro',
        href: '/records/create',
        icon: SquarePen,
    },
    {
        title: 'Registros',
        href: '/records',
        icon: Logs,
    },
    {
        title: 'Imágenes',
        href: '/images',
        icon: Images,
    },
    {
        title: 'Favoritos',
        href: '/favorites',
        icon: Star,
    },
    {
        title: 'Mapa',
        href: '/map',
        icon: Map,
    },
    {
        title: 'Procesamientos',
        href: '/image-processing',
        icon: Cpu,
    }
];

const adminNavItems: NavItem[] = [
    {
        title: 'Gestión de usuarios',
        href: '/admin/user-management',
        icon: UsersRound,
    },
    {
        title: 'Límites de usuario',
        href: '/admin/user-limits',
        icon: UserRoundCog,
    }
];


const footerNavItems: NavItem[] = [
    
];

type PageProps = {
    auth?: {
        user?: User;
    };
};

export function AppSidebar() {

    const page = usePage();
    const { auth } = usePage<PageProps>().props;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/records" >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>

                <SidebarGroup className="px-2 py-0">
                    {(auth?.user?.is_admin || false) &&     
                    <SidebarGroupLabel>Enlaces de Usuario</SidebarGroupLabel>}
                    <SidebarMenu>
                        {mainNavItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton  
                                    asChild isActive={item.href === page.url}
                                    tooltip={{ children: item.title }}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>

                {(auth?.user?.is_admin || false) && (
                    <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Enlaces de Admin</SidebarGroupLabel>
                    <SidebarMenu>
                        {adminNavItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton  
                                    asChild isActive={item.href === page.url}
                                    tooltip={{ children: item.title }}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
