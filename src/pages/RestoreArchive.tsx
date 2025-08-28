import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileArchive, AlertCircle } from "lucide-react";
import { restoreEncryptedArchive } from "@/utils/encryption";
import { useToast } from "@/hooks/use-toast";

export default function RestoreArchive() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.ax4zip')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file",
          description: "Please select a .ax4zip file",
          variant: "destructive",
        });
      }
    }
  };

  const handleRestore = async () => {
    if (!file || !passphrase.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a file and enter the passphrase",
        variant: "destructive",
      });
      return;
    }

    setIsRestoring(true);
    try {
      const surveyId = await restoreEncryptedArchive(file, passphrase);
      
      toast({
        title: "Restore successful",
        description: "Survey and photos have been restored",
      });
      
      // Navigate to the restored survey
      navigate(`/survey/${surveyId}`);
    } catch (error) {
      console.error('Restore failed:', error);
      toast({
        title: "Restore failed",
        description: error instanceof Error ? error.message : "Failed to restore archive",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="Restore Archive" 
        showBack={true}
      />
      
      <div className="container mx-auto p-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileArchive className="h-5 w-5 text-primary" />
              Restore Encrypted Archive
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <FileArchive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Select an encrypted .ax4zip archive to restore
              </p>
              <Button 
                onClick={() => document.getElementById('archive-upload')?.click()}
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Select Archive File
              </Button>
              <input
                id="archive-upload"
                type="file"
                accept=".ax4zip"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {file && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">Selected file:</p>
                <p className="text-sm text-muted-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="passphrase">Archive Passphrase</Label>
              <Input
                id="passphrase"
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter the passphrase used to encrypt this archive"
                disabled={isRestoring}
              />
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Important notes:</p>
                <ul className="space-y-1 text-xs">
                  <li>• The passphrase must match exactly what was used during export</li>
                  <li>• This will restore the survey data and all associated photos</li>
                  <li>• If a survey with the same ID exists, it will be overwritten</li>
                </ul>
              </div>
            </div>

            <Button 
              onClick={handleRestore}
              disabled={!file || !passphrase.trim() || isRestoring}
              className="w-full"
              variant="professional"
            >
              {isRestoring ? "Restoring..." : "Restore Archive"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}