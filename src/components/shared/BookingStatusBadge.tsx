import Badge from '@/components/ui/Badge'
import type { BookingStatus } from '@/types/app'

export default function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const labels: Record<BookingStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }

  return <Badge variant={status}>{labels[status]}</Badge>
}
