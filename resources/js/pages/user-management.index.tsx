import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogFooter, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatFechaEspanola, obtenerHoraEspanola } from '@/lib/utils';
import { Auth, Image, Record, User, type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Head, router, usePage } from '@inertiajs/react';
import { DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Search, Trash } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Management',
        href: '/admin/user-management',
    },
];

export default function UserManagement({ users }: { users: User[] }) {

    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Records" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="w-full"> 
                    <Card className="mb-3">
                        <CardHeader>
                            <CardTitle>Usuarios</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead className="text-left">ID</TableHead>
                                <TableHead className="text-left">Nombre</TableHead>
                                <TableHead className="text-left">Email</TableHead>
                                <TableHead className="text-left">Creado</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="text-left w-[60px]">{user.id}</TableCell>
                                    <TableCell className="font-medium text-left">{user.name}</TableCell>
                                    <TableCell className="text-left">{user.email}</TableCell>
                                    <TableCell >
                                        <span className="text-xs text-muted-foreground">
                                        {formatFechaEspanola(user.created_at)}, {obtenerHoraEspanola(user.created_at)}
                                        </span>
                                    </TableCell>
                                    { user.id !== (auth?.user?.id) && (
                                        
                                    <TableCell>
                                        <Dialog>
                                            <DialogTrigger asChild className='hover:text-red-600 cursor-pointer'>
                                                <Trash className="h-5 w-5 cursor-pointer" />
                                            </DialogTrigger>
                                            <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Eliminar usuario</DialogTitle>
                                                <DialogDescription>
                                                  ¿Eliminar usuario {user.name}?
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter className="flex flex-row f-end justify-between pt-4">
                                                <DialogClose asChild>
                                                    <Button variant="secondary" className='cursor-pointer'>Cancel</Button>
                                                </DialogClose>
                                                <Button variant="destructive" className='cursor-pointer' onClick={() => router.delete(route('admin.user-management.destroy', user.id))}>Eliminar</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                    )}
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}