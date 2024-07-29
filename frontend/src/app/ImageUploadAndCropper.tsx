import React, { useState, useRef, forwardRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from "@/components/ui/button"

interface ImageUploadAndCropperProps {
  onImageCropped: (image: File | null) => void
  onClose: () => void
  currentImage: string | null
}

interface CustomCrop extends Crop {
  aspect?: number
}

const ImageUploadAndCropper = forwardRef<HTMLDivElement, ImageUploadAndCropperProps>(({ onImageCropped, onClose, currentImage }, ref) => {
  const [image, setImage] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [crop, setCrop] = useState<CustomCrop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
        setDialogOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setImage(null)
  }

  const removeProfilePicture = () => {
    onImageCropped(null)
    clearFileInput()
  }


  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1,
        width,
        height
      ),
      width,
      height
    )
    setCrop(crop)
  }

  const handleCropComplete = (crop: PixelCrop) => {
    setCompletedCrop(crop)
  }

  const handleCrop = () => {
    if (completedCrop && imageRef.current) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('No 2d context')
      }

      const scaleX = imageRef.current.naturalWidth / imageRef.current.width
      const scaleY = imageRef.current.naturalHeight / imageRef.current.height

      const pixelRatio = window.devicePixelRatio
      canvas.width = completedCrop.width * pixelRatio
      canvas.height = completedCrop.height * pixelRatio

      ctx.scale(pixelRatio, pixelRatio)
      ctx.imageSmoothingQuality = 'high'

      const cropX = completedCrop.x * scaleX
      const cropY = completedCrop.y * scaleY

      const centerX = canvas.width / 2 / pixelRatio
      const centerY = canvas.height / 2 / pixelRatio

      ctx.save()
      ctx.beginPath()
      ctx.arc(centerX, centerY, completedCrop.width / 2, 0, 2 * Math.PI)
      ctx.clip()

      ctx.drawImage(
        imageRef.current,
        cropX,
        cropY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      )

      ctx.restore()

      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], 'profile-pic.jpg', { type: 'image/jpeg' })
          onImageCropped(croppedFile)
          setDialogOpen(false)
        }
      }, 'image/jpeg')
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <div className="flex space-x-2">
        <Button
          variant="outline"
          className="text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white"
          onClick={() => fileInputRef.current?.click()}
        >
          Choose File
        </Button>
        {currentImage && (
          <Button
            variant="outline"
            className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
            onClick={removeProfilePicture}
          >
            Remove Profile Picture
          </Button>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          {image && (
            <div>
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c as CustomCrop)}
                onComplete={(c) => handleCropComplete(c)}
                aspect={1}
                circularCrop
              >
                <img src={image} ref={imageRef} onLoad={onImageLoad} />
              </ReactCrop>
              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  className="bg-orange-500 text-white hover:bg-orange-600"
                  onClick={handleCrop}
                >
                  Save & Upload
                </Button>
                <Button
                  variant="outline"
                  className="text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
})

export default ImageUploadAndCropper