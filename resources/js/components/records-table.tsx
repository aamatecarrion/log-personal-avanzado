import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRecordsStore } from "@/store/recordsStore"
import { useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { MoreHorizontal, MoreVertical } from "lucide-react"
import { Button } from "./ui/button"

export function RecordsTable() {
  const records = useRecordsStore((state) => state.records)
  const fetchRecords = useRecordsStore((state) => state.fetchRecords)

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])  // Agregar dependencia para evitar warnings

  return (
    <Table>
      <TableCaption>A list of your recent records.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Created</TableHead>
          <TableHead>Title</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
  {Array.isArray(records) && records.length > 0 ? (
    records.map((record) => (
      <TableRow key={record.id}>
        <TableCell>{record.created_at}</TableCell>
        <TableCell className="font-medium">{record.title}</TableCell>
        <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={4}>No records found</TableCell>
    </TableRow>
  )}
</TableBody>
    </Table>
  )
}
