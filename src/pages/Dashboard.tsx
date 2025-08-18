import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/RiskBadge";
import { Plus, FileText, Download, MapPin, Clock, Building2, Trash2, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSurveys, getItemsBySurveyId, getSurveyData, deleteSurvey } from "@/utils/storage";
import { generateDOCXReport } from "@/utils/docx";
import { generatePDFReport } from "@/utils/pdf";
import { Survey } from "@/types/survey";
import { useToast } from "@/hooks/use-toast";
import { 
  getExportStatus, 
  markDocxExported, 
  markPdfExported 
} from "@/utils/exportStatus";
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
} from "@/components/ui/alert-dialog";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [surveys, setSurveys] = useState<Survey[]>([]);

  useEffect(() => {
    setSurveys(getSurveys());
  }, []);

  const handleGenerateReport = async (surveyId: string) => {
    try {
      const surveyData = getSurveyData(surveyId);
      if (!surveyData) {
        toast({
          title: "Error",
          description: "Survey data not found",
          variant: "destructive",
        });
        return;
      }
      
      await generateDOCXReport(surveyData);
      setSurveys([...surveys]); // Trigger re-render to update badges
      toast({
        title: "Export Complete",
        description: "DOCX report has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate DOCX report",
        variant: "destructive",
      });
    }
  };

  const handleGeneratePDFReport = async (surveyId: string) => {
    try {
      const surveyData = getSurveyData(surveyId);
      if (!surveyData) {
        toast({
          title: "Error",
          description: "Survey data not found",
          variant: "destructive",
        });
        return;
      }
      
      generatePDFReport(surveyData);
      markPdfExported(surveyId);
      setSurveys([...surveys]); // Trigger re-render to update badges
      toast({
        title: "Export Complete",
        description: "PDF report has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSurvey = (surveyId: string, siteName: string) => {
    deleteSurvey(surveyId);
    setSurveys(getSurveys());
    toast({
      title: "Survey Deleted",
      description: `Survey for ${siteName} has been deleted`,
    });
  };

  const getSurveyStats = (surveyId: string) => {
    const items = getItemsBySurveyId(surveyId);
    const riskCounts = items.reduce((acc, item) => {
      acc[item.riskLevel] = (acc[item.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { totalItems: items.length, riskCounts };
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="AX4 Survey Tool" 
        actions={
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('/history')}
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              History
            </Button>
            <Button 
              onClick={() => navigate('/new-survey')}
              variant="professional"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Survey</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        }
      />
      
      <div className="container mx-auto p-4 space-y-6">
        {/* Mobile Quick Actions */}
        <div className="sm:hidden flex gap-2">
          <Button 
            onClick={() => navigate('/history')}
            variant="outline"
            size="sm"
            className="flex-1 flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            View History
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your asbestos surveys and generate reports
            </p>
          </div>
        </div>
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Surveys</p>
                  <p className="text-2xl font-bold">{surveys.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Surveys</p>
                  <p className="text-2xl font-bold">{surveys.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Download className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reports Ready</p>
                  <p className="text-2xl font-bold">{surveys.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Surveys List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Surveys</h2>
            {surveys.length === 0 && (
              <Button 
                onClick={() => navigate('/new-survey')}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Start Your First Survey
              </Button>
            )}
          </div>
          
          {surveys.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No surveys yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your first asbestos survey to begin building professional reports.
                </p>
                <Button 
                  onClick={() => navigate('/new-survey')}
                  variant="professional"
                >
                  <Plus className="h-4 w-4" />
                  Create New Survey
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {surveys.map((survey) => {
                const { totalItems, riskCounts } = getSurveyStats(survey.surveyId);
                
                return (
                  <Card key={survey.surveyId} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{survey.siteName}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="font-medium">Job ID: {survey.jobId}</span>
                            <Badge variant="outline">{survey.surveyType}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleGenerateReport(survey.surveyId)}
                            variant="outline"
                            size="sm"
                            className="min-h-[44px] px-3"
                          >
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline ml-1">DOCX</span>
                          </Button>
                          <Button
                            onClick={() => handleGeneratePDFReport(survey.surveyId)}
                            variant="outline"
                            size="sm"
                            className="min-h-[44px] px-3"
                          >
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline ml-1">PDF</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="min-h-[44px] px-3"
                              >
                                <Trash2 className="h-4 w-4" />
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
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(survey.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Surveyor:</span>
                            <span>{survey.surveyor}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Client:</span>
                            <span>{survey.clientName}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Items Recorded: </span>
                            <span>{totalItems}</span>
                          </div>
                          {totalItems > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {riskCounts.High && <RiskBadge risk="High" />}
                              {riskCounts.Medium && <RiskBadge risk="Medium" />}
                              {riskCounts.Low && <RiskBadge risk="Low" />}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => navigate(`/survey/${survey.surveyId}`)}
                          variant="professional"
                          size="sm"
                          className="flex-1 min-h-[44px]"
                        >
                          <span className="sm:hidden">Continue</span>
                          <span className="hidden sm:inline">Continue Survey</span>
                        </Button>
                        <Button
                          onClick={() => navigate(`/survey/${survey.surveyId}`)}
                          variant="outline"
                          size="sm"
                          className="min-h-[44px] px-3"
                        >
                          <FileText className="h-4 w-4" />
                          <span className="hidden sm:inline ml-1">Preview</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}