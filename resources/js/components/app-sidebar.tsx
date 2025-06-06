import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Cpu, Folder, ImagePlus, Images, LayoutGrid, Logs, Map, SquarePen, Star, StopCircle, User, User2, UserRoundCog, UsersRound, WorkflowIcon } from 'lucide-react';
import AppLogo from './app-logo';
import { useEffect } from 'react';

const mainNavItems: NavItem[] = [
    {
        title: 'New Record',
        href: '/records/create',
        icon: SquarePen,
    },
    {
        title: 'Records',
        href: '/records',
        icon: Logs,
    },
    {
        title: 'Upload images',
        href: '/images/upload',
        icon: ImagePlus
    },
    {
        title: 'Images',
        href: '/images',
        icon: Images,
    },
    {
        title: 'Favorites',
        href: '/favorites',
        icon: Star,
    },
    {
        title: 'Map',
        href: '/map',
        icon: Map,
    },
    {
        title: 'Image Processing',
        href: '/image-processing',
        icon: Cpu,
    }
];



const footerNavItems: NavItem[] = [
    
];

type AuthUser = {
    is_admin?: boolean;
    // add other user properties if needed
};

type PageProps = {
    auth?: {
        user?: AuthUser;
    };
    // add other props if needed
};

export function AppSidebar() {

    const { auth } = usePage<PageProps>().props;
    const adminNavItems: NavItem[] = [
        {
            title: 'User Management',
            href: '/admin/user-management',
            icon: UsersRound,
        },
        {
            title: 'User Limits',
            href: '/user-limits',
            icon: UserRoundCog,
        }
    ];
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
                <NavMain items={[...mainNavItems, ...(auth?.user?.is_admin ? adminNavItems : [])]} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
