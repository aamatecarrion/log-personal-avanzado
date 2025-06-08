import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { MoreVertical, Search, Trash } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { formatFechaEspanola, obtenerHoraEspanola } from '@/lib/utils';
import { type Auth, type User, type BreadcrumbItem } from '@/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Limits',
        href: '/admin/user-limits',
    },
];

export default function UserLimits({ users }: { users: User[] }) {
    const { auth } = usePage<{ auth: Auth }>().props;

    const handleToggle = (userId: number, field: 'can_upload_images' | 'can_process_images', checked: boolean) => {
        router.put(
            route('admin.user-limits.update', { user_limit: userId }),
            {
                user_id: userId,
                [field]: checked,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    console.log(`User ${userId} ${field} updated to ${checked}`);
                    router.reload() 
                },
                onError: (error) => {
                    console.error(`Error updating user ${userId} ${field}:`, error);
                },
            }
        );
    };

    const handleInputChange = ( userId: number, field: 'daily_upload_limit' | 'daily_process_limit', value: number ) => {
        router.put(
            route('admin.user-limits.update', { user_limit: userId }),
            {
                user_id: userId,
                [field]: value,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    console.log(`User ${userId} ${field} updated to ${value}`);
                },
                onError: (error) => {
                    console.error(`Error updating user ${userId} ${field}:`, error);
                },
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Limits" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Card className="mb-3">
                    <CardHeader>
                        <CardTitle>Usuarios</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-left">Nombre</TableHead>
                                    <TableHead className="text-left">Email</TableHead>
                                    <TableHead className="text-left">Subir imágenes</TableHead>
                                    <TableHead className="text-left">Procesar imágenes</TableHead>
                                    <TableHead className="text-left">Subidas/día</TableHead>
                                    <TableHead className="text-left">Procesamientos/día</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="text-left">{user.name}</TableCell>
                                        <TableCell className="text-left">{user.email}</TableCell>
                                        <TableCell className="text-left">
                                            <Switch
                                                className="cursor-pointer"
                                                checked={user.user_limit?.can_upload_images}
                                                onCheckedChange={(checked) =>
                                                    handleToggle(user.id, 'can_upload_images', checked)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="text-left">
                                            <Switch
                                                className="cursor-pointer"
                                                checked={user.user_limit?.can_process_images}
                                                onCheckedChange={(checked) =>
                                                    handleToggle(user.id, 'can_process_images', checked)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                className="w-20"
                                                value={user.user_limit?.daily_upload_limit || 0}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    if (!isNaN(val)) {
                                                        handleInputChange(user.id, 'daily_upload_limit', val);
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                className="w-20"
                                                value={user.user_limit?.daily_process_limit || 0}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    if (!isNaN(val)) {
                                                        handleInputChange(user.id, 'daily_process_limit', val);
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
