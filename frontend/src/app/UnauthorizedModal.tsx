import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface UnauthorizedModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
}

export default function UnauthorizedModal({ isOpen, onClose, message }: UnauthorizedModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unauthorized Access</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}