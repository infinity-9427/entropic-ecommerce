'use client'

import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
  itemName?: string
  isLoading?: boolean
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Delete Item",
  description,
  itemName,
  isLoading = false
}: DeleteConfirmationDialogProps) {
  console.log('DeleteConfirmationDialog render - open:', open, 'itemName:', itemName)
  
  const defaultDescription = itemName 
    ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
    : "Are you sure you want to delete this item? This action cannot be undone."

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 leading-relaxed">
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Deleting...</span>
              </div>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
