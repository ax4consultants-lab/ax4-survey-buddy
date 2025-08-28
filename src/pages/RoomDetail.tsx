import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/RiskBadge";
import { Plus, Package, Eye, Edit, Trash2 } from "lucide-react";
import { getSurveyById, getRoomsBySurveyId, getItemsByRoomId } from "@/utils/storage";
import { Survey, Room, Item } from "@/schemas";

export default function RoomDetail() {
  const { surveyId, roomId } = useParams<{ surveyId: string; roomId: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!surveyId || !roomId) return;
    
    const surveyData = getSurveyById(surveyId);
    const rooms = getRoomsBySurveyId(surveyId);
    const roomData = rooms.find(r => r.roomId === roomId);
    const itemsData = getItemsByRoomId(roomId);
    
    setSurvey(surveyData);
    setRoom(roomData);
    setItems(itemsData);
    setLoading(false);
  }, [surveyId, roomId]);

  if (loading || !survey || !room) {
    return <div className="min-h-screen bg-background"></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title={room.roomName}
        showBack={true}
        actions={
          <Button 
            onClick={() => navigate(`/survey/${surveyId}/room/${roomId}/add-item`)}
            variant="professional"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        }
      />
      
      <div className="container mx-auto p-4 space-y-6">
        {/* Room Info */}
        <Card>
          <CardHeader>
            <CardTitle>Room Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Survey:</span> {survey.siteName}
              </div>
              <div>
                <span className="font-medium">Job ID:</span> {survey.jobId}
              </div>
              <div>
                <span className="font-medium">Total Items:</span> {items.length}
              </div>
              <div>
                <span className="font-medium">Room:</span> {room.roomName}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Items in this Room</h2>
            {items.length === 0 && (
              <Button 
                onClick={() => navigate(`/survey/${surveyId}/room/${roomId}/add-item`)}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Add First Item
              </Button>
            )}
          </div>
          
          {items.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No items recorded yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start recording asbestos-containing items found in this room.
                </p>
                <Button 
                  onClick={() => navigate(`/survey/${surveyId}/room/${roomId}/add-item`)}
                  variant="professional"
                >
                  <Plus className="h-4 w-4" />
                  Add First Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {items.map((item) => (
                <Card key={item.itemId} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">Ref: {item.referenceNumber}</CardTitle>
                          <RiskBadge risk={item.riskLevel} />
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">
                          {item.itemUse}
                        </p>
                      </div>
                      {item.photos.length > 0 && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {item.photos.length}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Location:</p>
                        <p className="text-sm">{item.buildingArea} - {item.location1} - {item.location2}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Material:</p>
                          <p className="text-sm">{item.materialType}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Risk Level:</p>
                          <p className="text-sm">{item.riskLevel}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Recommendation:</p>
                        <p className="text-sm">{item.recommendation}</p>
                      </div>
                      
                      {item.notes && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Notes:</p>
                          <p className="text-sm">{item.notes}</p>
                        </div>
                      )}
                      
                      {item.warningLabelsAffixed && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Warning Labels:</p>
                          <p className="text-sm">{item.warningLabelsAffixed} affixed</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}