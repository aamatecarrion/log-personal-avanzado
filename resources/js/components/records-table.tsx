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
import { Car, MoreVertical, Search, SearchCheck, Trash } from "lucide-react"
import { Button } from "./ui/button"
import { Record } from "@/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { router } from "@inertiajs/react"


function formatDate(dateString: string) {
  const dateUTC = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }
  let formattedDate = new Intl.DateTimeFormat("es-ES", options).format(dateUTC)
  formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)
  return formattedDate
}
function formatTime(dateString: string) {
  const dateUTC = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  }
  return new Intl.DateTimeFormat("es-ES", options).format(dateUTC)
}

export function RecordsTable() {
  const records = useRecordsStore((state) => state.records)
  const fetchRecords = useRecordsStore((state) => state.fetchRecords)

  const groupedRecords = groupByDay(records)

  function groupByDay(records: Record[]) {
    const groups: { [date: string]: Record[] } = {}

    records.forEach((record) => {
      const dayTitle = formatDate(record.created_at)
      const recordWithLocalTime = { ...record, local_time: formatTime(record.created_at) }
      if (!groups[dayTitle]) groups[dayTitle] = []
      groups[dayTitle].push(recordWithLocalTime)
    })

    return groups
  }

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  return (
    <div>
      <div className="w-full">
        {groupedRecords && Object.keys(groupedRecords).length > 0 ? (
          Object.entries(groupedRecords).map(([date, records]) => (
            <Card className="mb-3" key={date}>
              <CardHeader>
                <CardTitle>{date}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record.id} onClick={() => router.visit(`/records/${record.id}`)} className="cursor-pointer">
                        <TableCell className="text-left w-[60px]">{record.local_time}</TableCell>
                        <TableCell className="font-medium text-left">{record.title}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer" onClick={() => console.log("Delete")}>
                                <Trash className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                              <DropdownMenuItem>Action 2</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent>No records found</CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
