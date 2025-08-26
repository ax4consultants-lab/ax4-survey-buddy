import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getSettings, saveSettings } from '@/storage/db';
import { Settings, SettingsSchema } from '@/schemas';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>({
    assessorName: '',
    assessorLicence: '',
    companyName: '',
    companyLogo: undefined,
    defaultDisclaimer: '',
    defaultFooter: '',
    version: '1.0.0',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await getSettings();
      if (savedSettings) {
        const validatedSettings = SettingsSchema.parse(savedSettings);
        setSettings(validatedSettings);
        if (validatedSettings.companyLogo) {
          setLogoPreview(validatedSettings.companyLogo);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const validatedSettings = SettingsSchema.parse(settings);
      await saveSettings(validatedSettings);
      toast({
        title: 'Settings Saved',
        description: 'Your settings have been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setSettings(prev => ({ ...prev, companyLogo: dataUrl }));
        setLogoPreview(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setSettings(prev => ({ ...prev, companyLogo: undefined }));
    setLogoPreview(null);
  };

  const handleInputChange = (field: keyof Settings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Configure assessor details and report preferences
            </p>
          </div>
        </div>

        {/* Assessor Information */}
        <Card>
          <CardHeader>
            <CardTitle>Assessor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assessorName">Assessor Name</Label>
                <Input
                  id="assessorName"
                  value={settings.assessorName}
                  onChange={(e) => handleInputChange('assessorName', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assessorLicence">Licence Number</Label>
                <Input
                  id="assessorLicence"
                  value={settings.assessorLicence}
                  onChange={(e) => handleInputChange('assessorLicence', e.target.value)}
                  placeholder="Enter licence number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Enter company name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Company Logo */}
        <Card>
          <CardHeader>
            <CardTitle>Company Logo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {logoPreview ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                  <img
                    src={logoPreview}
                    alt="Company Logo"
                    className="max-h-32 mx-auto object-contain"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Replace Logo
                  </Button>
                  <Button variant="outline" onClick={handleRemoveLogo}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Logo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Upload your company logo for reports
                </p>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  Choose File
                </Button>
              </div>
            )}
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Report Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Report Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultDisclaimer">Default Disclaimer</Label>
              <Textarea
                id="defaultDisclaimer"
                value={settings.defaultDisclaimer}
                onChange={(e) => handleInputChange('defaultDisclaimer', e.target.value)}
                placeholder="Enter default disclaimer text for reports"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultFooter">Default Footer</Label>
              <Textarea
                id="defaultFooter"
                value={settings.defaultFooter}
                onChange={(e) => handleInputChange('defaultFooter', e.target.value)}
                placeholder="Enter default footer text for reports"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={settings.version}
                onChange={(e) => handleInputChange('version', e.target.value)}
                placeholder="1.0.0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;