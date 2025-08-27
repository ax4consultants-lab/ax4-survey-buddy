import React, { useState } from 'react';
import { FileText, FileImage, Lock, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { SurveyData, Room } from '@/schemas';
import { buildReportData } from '@/export/buildReportData';
import { generateDOCXReport } from '@/utils/docx';
import { generatePDFReport } from '@/utils/pdf';
import { createEncryptedArchive } from '@/utils/encryption';
import { getSettings } from '@/storage/db';
import { useNavigate } from 'react-router-dom';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  surveyData: SurveyData;
  selectedItems?: string[];
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  surveyData,
  selectedItems,
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [includePhotos, setIncludePhotos] = useState(true);
  const [maxPhotosPerItem, setMaxPhotosPerItem] = useState(10);
  const [encryptionPassphrase, setEncryptionPassphrase] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleRoomToggle = (roomId: string) => {
    setSelectedRooms(prev => 
      prev.includes(roomId)
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleSelectAllRooms = () => {
    setSelectedRooms(surveyData.rooms.map(room => room.roomId));
  };

  const handleDeselectAllRooms = () => {
    setSelectedRooms([]);
  };

  const getExportOptions = () => ({
    selectedItemIds: selectedItems,
    selectedRoomIds: selectedRooms.length > 0 ? selectedRooms : undefined,
    includePhotos,
    maxPhotosPerItem,
  });

  const handleExportDOCX = async () => {
    try {
      setIsExporting(true);
      const settings = await getSettings();
      const reportData = await buildReportData(surveyData, settings, getExportOptions());
      await generateDOCXReport(reportData);
      
      toast({
        title: 'Export Successful',
        description: 'DOCX report has been generated and downloaded.',
      });
      onClose();
    } catch (error) {
      console.error('Error exporting DOCX:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to generate DOCX report.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const settings = await getSettings();
      const reportData = await buildReportData(surveyData, settings, getExportOptions());
      await generatePDFReport(reportData);
      
      toast({
        title: 'Export Successful',
        description: 'PDF report has been generated and downloaded.',
      });
      onClose();
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to generate PDF report.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportEncrypted = async () => {
    if (!encryptionPassphrase) {
      toast({
        title: 'Passphrase Required',
        description: 'Please enter a passphrase for encryption.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsExporting(true);
      await createEncryptedArchive(surveyData, encryptionPassphrase);
      
      toast({
        title: 'Export Successful',
        description: 'Encrypted archive has been created and downloaded.',
      });
      onClose();
    } catch (error) {
      console.error('Error creating encrypted archive:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to create encrypted archive.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Export Survey Report</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onClose();
                navigate('/settings');
              }}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Room Selection */}
          {surveyData.rooms.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Select Rooms (Optional)</Label>
              <div className="flex gap-2 mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllRooms}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAllRooms}
                >
                  Deselect All
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {surveyData.rooms.map((room: Room) => (
                  <div key={room.roomId} className="flex items-center space-x-2">
                    <Checkbox
                      id={room.roomId}
                      checked={selectedRooms.includes(room.roomId)}
                      onCheckedChange={() => handleRoomToggle(room.roomId)}
                    />
                    <Label htmlFor={room.roomId} className="text-sm">
                      {room.roomName}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photo Options */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Photo Options</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includePhotos"
                checked={includePhotos}
                onCheckedChange={(checked) => setIncludePhotos(!!checked)}
              />
              <Label htmlFor="includePhotos">Include photos in export</Label>
            </div>
            {includePhotos && (
              <div className="space-y-2">
                <Label htmlFor="maxPhotos" className="text-sm">
                  Maximum photos per item
                </Label>
                <Input
                  id="maxPhotos"
                  type="number"
                  min="1"
                  max="50"
                  value={maxPhotosPerItem}
                  onChange={(e) => setMaxPhotosPerItem(parseInt(e.target.value) || 10)}
                  className="w-24"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Export Formats */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Export Format</Label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleExportDOCX}
                disabled={isExporting}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <FileText className="h-8 w-8" />
                <span className="font-medium">Export DOCX</span>
                <span className="text-xs text-muted-foreground">
                  Word document format
                </span>
              </Button>

              <Button
                variant="outline"
                onClick={handleExportPDF}
                disabled={isExporting}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <FileImage className="h-8 w-8" />
                <span className="font-medium">Export PDF</span>
                <span className="text-xs text-muted-foreground">
                  Portable document format
                </span>
              </Button>
            </div>

            {/* Encrypted Archive */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                <span className="font-medium">Encrypted Archive (.ax4zip)</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Create an encrypted archive containing survey data and photos
              </p>
              <div className="space-y-2">
                <Label htmlFor="passphrase">Encryption Passphrase</Label>
                <Input
                  id="passphrase"
                  type="password"
                  value={encryptionPassphrase}
                  onChange={(e) => setEncryptionPassphrase(e.target.value)}
                  placeholder="Enter a strong passphrase"
                />
              </div>
              <Button
                onClick={handleExportEncrypted}
                disabled={isExporting || !encryptionPassphrase.trim()}
                className="w-full"
              >
                <Lock className="h-4 w-4 mr-2" />
                Create Encrypted Archive
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;