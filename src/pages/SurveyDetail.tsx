import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/RiskBadge";
import { Plus, Building2, Package, FileText, Download, Edit } from "lucide-react";
import { getSurveyById, getRoomsBySurveyId, getItemsBySurveyId, getSurveyData } from "@/utils/storage";
import { generateDOCXReport } from "@/utils/docx";
import { buildReportData } from "@/export/buildReportData";
import { getSettings } from "@/storage/db";
import { Survey, Room, Item } from "@/schemas";
import { useToast } from "@/hooks/use-toast";

export default function SurveyDetail() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!surveyId) return;
    
    const surveyData = getSurveyById(surveyId);
    if (!surveyData) {
      navigate('/');
      return;
    }
    
    setSurvey(surveyData);
    setRooms(getRoomsBySurveyId(surveyId));
    setItems(getItemsBySurveyId(surveyId));
    setLoading(false);
  }, [surveyId, navigate]);

  const handleGenerateReport = async () => {
    if (!surveyId) return;
    
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
      
      const settings = await getSettings();
      const reportData = await buildReportData(surveyData, settings);
      await generateDOCXReport(reportData);
      toast({
        title: "Success",
        description: "DOCX report generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate DOCX report",
        variant: "destructive",
      });
    }
  };

  const getRoomStats = (roomId: string) => {
    const roomItems = items.filter(item => item.surveyId === surveyId);
    const riskCounts = roomItems.reduce((acc, item) => {
      acc[item.riskLevel] = (acc[item.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { totalItems: roomItems.length, riskCounts };
  };

  if (loading || !survey) {
    return <div className="min-h-screen bg-background"></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title={survey.siteName}
        showBack={true}
        actions={
          <div className="flex gap-2">
            <Button 
              onClick={handleGenerateReport}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4" />
              DOCX
            </Button>
            <Button 
              onClick={() => navigate(`/survey/${surveyId}/add-item`)}
              variant="professional"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        }
      />
      
      <div className="container mx-auto p-4 space-y-6">
        {/* Survey Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Survey Information</CardTitle>
              <Badge variant="outline">{survey.surveyType}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Job ID:</span> {survey.jobId}
              </div>
              <div>
                <span className="font-medium">Surveyor:</span> {survey.surveyor}
              </div>
              <div>
                <span className="font-medium">Date:</span> {new Date(survey.date).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Client:</span> {survey.clientName}
              </div>
              <div>
                <span className="font-medium">Document Type:</span> {survey.documentType}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Survey Items</h2>
            <Button 
              onClick={() => navigate(`/survey/${surveyId}/add-item`)}
              variant="professional"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
          
          {items.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No items added yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding your first item with location, material type, condition and recommended actions.
                </p>
                <Button 
                  onClick={() => navigate(`/survey/${surveyId}/add-item`)}
                  variant="professional"
                >
                  <Plus className="h-4 w-4" />
                  Add First Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Items Preview ({items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Building Area</th>
                        <th className="text-left p-2 font-medium">Ext/Int</th>
                        <th className="text-left p-2 font-medium">Location 1</th>
                        <th className="text-left p-2 font-medium">Location 2</th>
                        <th className="text-left p-2 font-medium">Material</th>
                        <th className="text-left p-2 font-medium">Condition</th>
                        <th className="text-left p-2 font-medium">Access</th>
                        <th className="text-left p-2 font-medium">Risk</th>
                        <th className="text-left p-2 font-medium">Recommendation</th>
                        <th className="text-left p-2 font-medium">Photos</th>
                        <th className="text-left p-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={item.itemId} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                          <td className="p-2">{item.buildingArea}</td>
                          <td className="p-2">{item.externalInternal}</td>
                          <td className="p-2">{item.location1}</td>
                          <td className="p-2">{item.location2}</td>
                          <td className="p-2 max-w-[150px] truncate" title={item.materialType}>
                            {item.materialType}
                          </td>
                          <td className="p-2">{item.condition}</td>
                          <td className="p-2">{item.accessibility}</td>
                          <td className="p-2">
                            <RiskBadge risk={item.riskLevel} />
                          </td>
                          <td className="p-2 max-w-[200px] truncate" title={item.recommendation}>
                            {item.recommendation}
                          </td>
                          <td className="p-2">{item.photos.length}</td>
                          <td className="p-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/survey/${surveyId}/edit-item/${item.itemId}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}