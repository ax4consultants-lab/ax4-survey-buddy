import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/RiskBadge";
import { Plus, Building2, Package, FileText, Download } from "lucide-react";
import { getSurveyById, getRoomsBySurveyId, getItemsByRoomId, getSurveyData } from "@/utils/storage";
import { generateDOCXReport } from "@/utils/docx";
import { Survey, Room, Item } from "@/types/survey";
import { useToast } from "@/hooks/use-toast";

export default function SurveyDetail() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
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
      
      await generateDOCXReport(surveyData);
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
    const items = getItemsByRoomId(roomId);
    const riskCounts = items.reduce((acc, item) => {
      acc[item.riskLevel] = (acc[item.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { totalItems: items.length, riskCounts };
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

        {/* Rooms List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Add First Item</h2>
            <Button 
              onClick={() => navigate(`/survey/${surveyId}/add-item`)}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Add First Item
            </Button>
          </div>
          
          {rooms.length === 0 ? (
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
            <div className="grid gap-4">
              {rooms.map((room) => {
                const { totalItems, riskCounts } = getRoomStats(room.roomId);
                
                return (
                  <Card key={room.roomId} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-primary" />
                          {room.roomName}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {totalItems} items
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {totalItems > 0 && (
                        <div className="flex gap-2 flex-wrap mb-4">
                          {riskCounts.High && <RiskBadge risk="High" />}
                          {riskCounts.Medium && <RiskBadge risk="Medium" />}
                          {riskCounts.Low && <RiskBadge risk="Low" />}
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigate(`/survey/${surveyId}/room/${room.roomId}/add-item`)}
                          variant="professional"
                          size="sm"
                          className="flex-1"
                        >
                          <Package className="h-4 w-4" />
                          Add Items
                        </Button>
                        <Button
                          onClick={() => navigate(`/survey/${surveyId}/room/${room.roomId}`)}
                          variant="outline"
                          size="sm"
                        >
                          <FileText className="h-4 w-4" />
                          View Items ({totalItems})
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