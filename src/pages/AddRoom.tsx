import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Building2 } from "lucide-react";
import { saveRoom, generateId } from "@/utils/storage";
import { Room } from "@/types/survey";
import { useToast } from "@/hooks/use-toast";

export default function AddRoom() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [roomName, setRoomName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a room name",
        variant: "destructive",
      });
      return;
    }

    if (!surveyId) return;

    const room: Room = {
      roomId: generateId(),
      surveyId,
      roomName: roomName.trim(),
      createdAt: new Date().toISOString(),
    };

    saveRoom(room);
    
    toast({
      title: "Room added",
      description: "Ready to add items to this room",
    });
    
    navigate(`/survey/${surveyId}/room/${room.roomId}/add-item`);
  };

  const handleFinishSurvey = () => {
    navigate(`/survey/${surveyId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="Add Room" 
        showBack={true}
      />
      
      <div className="container mx-auto p-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Room Details
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="roomName">Room/Area Name *</Label>
                <Input
                  id="roomName"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g., Kitchen, Living Room, Basement, External Wall"
                  required
                  autoFocus
                />
                <p className="text-sm text-muted-foreground">
                  Be specific about the location to help with report clarity
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  variant="professional"
                >
                  <Save className="h-4 w-4" />
                  Add Room & Continue
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleFinishSurvey}
                >
                  Finish Survey
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}