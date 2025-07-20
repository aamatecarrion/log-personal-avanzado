import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { type BreadcrumbItem, Favorite, User } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@headlessui/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import _ from 'lodash';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Experimentos',
    href: '/experiments',
  },
];

export default function Experiments() {
  const { user } = usePage<any>().props.auth;
  const [editableText, setEditableText] = useState("");

  const debouncedSendText = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    
    debouncedSendText.current = _.debounce((text: string) => {
      axios.post('/experiments', { text });
    }, 500, { leading: true, trailing: true , maxWait: 100 });
  }, []);

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newText = e.target.value;
    console.log('Change event:', newText);
    setEditableText(newText);
    
    if (debouncedSendText.current ){
      debouncedSendText.current(newText);
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Echo) {
      const channel = window.Echo.private(`user.${user.id}`);

      channel.listen('.text.change', (e: any) => {
        console.log('Received event:', e);
        setEditableText(e.text);
      });

      return () => {
        window.Echo.leave(`user.${user.id}`);
      };
    }
  }, [user.id]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Experimentos" />
      <div className="m-4 flex flex-col items-start flex-wrap gap-4">
        <Input
          type="text"
          value={editableText}
          onChange={handleTextChange}
          className={`w-full max-w-md border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        <Card>
          <CardHeader>
            <CardTitle>Texto editable</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <p style={{ whiteSpace: 'pre-wrap' }}>{editableText}</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}