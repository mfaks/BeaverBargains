export interface ImageUploadAndCropperProps {
  onImageCropped: (image: File | null) => void;
  onClose: () => void;
  currentImage: string | null;
}
