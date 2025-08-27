import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Eye, 
  FileDown, 
  Calendar,
  Building,
  User,
  Hash,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { Survey } from '@/types/survey';
import { getSurveys, getSurveyData, deleteSurvey } from '@/utils/storage';
import { getSettings } from '@/storage/db';
import { generateDOCXReport } from '@/utils/docx';
import { generatePDFReport } from '@/utils/pdf';
import { buildReportData } from '@/export/buildReportData';
import { 
  getExportStatus, 
  markDocxExported, 
  markPdfExported,
  clearExportStatus 
} from '@/utils/exportStatus';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const History = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setSurveys(getSurveys().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  }, []);

  const handleViewSurvey = (surveyId: string) => {
    navigate(`/survey/${surveyId}`);
  };

  const handleExportDOCX = async (surveyId: string) => {
    try {
      const surveyData = getSurveyData(surveyId);
      if (!surveyData) {
        toast({
          title: "Error",
          description: "Survey data not found",
          variant: "destructive"
        });
        return;
      }

      const settings = await getSettings();
      const reportData = await buildReportData(surveyData, settings);
      await generateDOCXReport(reportData);
      markDocxExported(surveyId);
      setSurveys([...surveys]); // Trigger re-render to update badges
      
      toast({
        title: "Export Complete",
        description: "DOCX report has been downloaded"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate DOCX report",
        variant: "destructive"
      });
    }
  };

  const handleExportPDF = async (surveyId: string) => {
    try {
      const surveyData = getSurveyData(surveyId);
      if (!surveyData) {
        toast({
          title: "Error",
          description: "Survey data not found",
          variant: "destructive"
        });
        return;
      }

      const settings = await getSettings();
      const reportData = await buildReportData(surveyData, settings);
      await generatePDFReport(reportData);
      markPdfExported(surveyId);
      setSurveys([...surveys]); // Trigger re-render to update badges
      
      toast({
        title: "Export Complete",
        description: "PDF report has been downloaded"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF report",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSurvey = async (surveyId: string, siteName: string) => {
    try {
      deleteSurvey(surveyId);
      clearExportStatus(surveyId);
      setSurveys(surveys.filter(s => s.surveyId !== surveyId));
      
      toast({
        title: "Survey Deleted",
        description: `Survey for ${siteName} has been deleted`
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete survey",
        variant: "destructive"
      });
    }
  };

  const getItemCount = (surveyId: string): number => {
    const surveyData = getSurveyData(surveyId);
    return surveyData?.items.length || 0;
  };

  const getExportBadges = (surveyId: string) => {
    const status = getExportStatus(surveyId);
    const badges = [];
    
    if (status.docxExported) {
      badges.push(
        <Badge key="docx" variant="secondary" className="text-xs">
          DOCX
        </Badge>
      );
    }
    
    if (status.pdfExported) {
      badges.push(
        <Badge key="pdf" variant="secondary" className="text-xs">
          PDF
        </Badge>
      );
    }
    
    if (!status.docxExported && !status.pdfExported) {
      badges.push(
        <Badge key="pending" variant="outline" className="text-xs border-amber-500 text-amber-600">
          Pending
        </Badge>
      );
    }
    
    return badges;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Survey History</h1>
              <p className="text-muted-foreground">
                View and export your completed surveys
              </p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{surveys.length}</p>
                  <p className="text-sm text-muted-foreground">Total Surveys</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Download className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {surveys.filter(s => {
                      const status = getExportStatus(s.surveyId);
                      return status.docxExported || status.pdfExported;
                    }).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Exported</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Building className="h-8 w-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {surveys.filter(s => {
                      const status = getExportStatus(s.surveyId);
                      return !status.docxExported && !status.pdfExported;
                    }).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending Export</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Surveys List */}
        {surveys.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Surveys Found</h3>
              <p className="text-muted-foreground mb-6">
                You haven't created any surveys yet. Start by creating your first survey.
              </p>
              <Button onClick={() => navigate('/new-survey')}>
                Create First Survey
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {surveys.map((survey) => (
              <Card key={survey.surveyId} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{survey.siteName}</CardTitle>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {survey.jobId}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {survey.clientName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(survey.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {getItemCount(survey.surveyId)} items
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {getExportBadges(survey.surveyId)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewSurvey(survey.surveyId)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportDOCX(survey.surveyId)}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Export DOCX
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportPDF(survey.surveyId)}
                      className="flex items-center gap-2"
                    >
                      <FileDown className="h-4 w-4" />
                      Export PDF
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Survey</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the survey for {survey.siteName}? 
                            This action cannot be undone and will remove all associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSurvey(survey.surveyId, survey.siteName)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Survey
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;