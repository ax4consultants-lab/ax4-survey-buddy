import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, RotateCcw, Check, X, Upload } from "lucide-react";
import { capturePhoto, resizeImage, isMediaCaptureAvailable, blobToDataURL } from "@/utils/camera";
import { processAndSavePhoto, generatePhotoId } from "@/utils/photo";
import { useToast } from "@/hooks/use-toast";

interface PhotoCaptureProps {
  onPhotoAccepted: (photoId: string) => void;
  onCancel?: () => void;
  className?: string;
}

export function PhotoCapture({ onPhotoAccepted, onCancel, className }: PhotoCaptureProps) {
  const { toast } = useToast();
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const cleanupStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Cleanup on unmount or navigation
  useEffect(() => {
    return cleanupStream;
  }, [stream]);

  const startCamera = async () => {
    if (!isMediaCaptureAvailable()) {
      toast({
        title: "Camera not available",
        description: "Camera access not supported on this device",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCapturing(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: 'environment' }, // Prefer rear camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false,
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      // Fallback to any camera if rear camera fails
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
      } catch (fallbackError) {
        toast({
          title: "Camera access denied",
          description: "Please allow camera access to take photos",
          variant: "destructive",
        });
        setIsCapturing(false);
      }
    }
  };

  const takePhoto = async () => {
    if (!videoRef.current || !stream) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      
      const resized = await resizeImage(dataUrl, 1024, 0.8);
      setPreviewImage(resized);
      cleanupStream();
      setIsCapturing(false);
    } catch (error) {
      toast({
        title: "Photo capture failed",
        description: "Failed to capture photo, please try again",
        variant: "destructive",
      });
    }
  };

  const retake = () => {
    setPreviewImage(null);
    startCamera();
  };

  const acceptPhoto = async () => {
    if (previewImage) {
      try {
        // Convert data URL to blob
        const response = await fetch(previewImage);
        const blob = await response.blob();
        
        // Process and save to IndexedDB
        const photoId = generatePhotoId();
        await processAndSavePhoto(blob, `photo_${photoId}.jpg`);
        
        onPhotoAccepted(photoId);
        setPreviewImage(null);
      } catch (error) {
        toast({
          title: "Save failed",
          description: "Failed to save photo",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    try {
      // Process and save to IndexedDB
      const photoId = generatePhotoId();
      await processAndSavePhoto(file, file.name);
      onPhotoAccepted(photoId);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to process image",
        variant: "destructive",
      });
    }
  };

  const cancel = () => {
    cleanupStream();
    setPreviewImage(null);
    setIsCapturing(false);
    onCancel?.();
  };

  if (previewImage) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="space-y-4">
            <img
              src={previewImage}
              alt="Photo preview"
              className="w-full max-h-80 object-contain rounded-lg border"
            />
            <div className="flex gap-2">
              <Button onClick={retake} variant="outline" className="flex-1">
                <RotateCcw className="h-4 w-4" />
                Retake
              </Button>
              <Button onClick={acceptPhoto} className="flex-1">
                <Check className="h-4 w-4" />
                Use Photo
              </Button>
            </div>
            {onCancel && (
              <Button onClick={cancel} variant="ghost" className="w-full">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isCapturing && stream) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="space-y-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-h-80 object-contain rounded-lg border bg-black"
            />
            <div className="flex gap-2">
              <Button onClick={takePhoto} className="flex-1">
                <Camera className="h-4 w-4" />
                Take Photo
              </Button>
              <Button onClick={cancel} variant="outline">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="text-center">
            <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Take a photo or upload from gallery
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Button onClick={startCamera} className="w-full">
              <Camera className="h-4 w-4" />
              Take Photo
            </Button>
            <Button 
              onClick={() => document.getElementById('photo-upload')?.click()} 
              variant="outline" 
              className="w-full"
            >
              <Upload className="h-4 w-4" />
              Upload from Gallery
            </Button>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </div>
          {onCancel && (
            <Button onClick={cancel} variant="ghost" className="w-full">
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}