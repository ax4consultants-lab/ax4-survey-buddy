import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Survey } from "@/schemas";
import { getRecommendationsForType } from "@/domain/recommendations";

interface RecommendationSelectProps {
  documentType: Survey['documentType'];
  value: string;
  onValueChange: (value: string) => void;
}


export function RecommendationSelect({ documentType, value, onValueChange }: RecommendationSelectProps) {
  const recommendations = getRecommendationsForType(documentType);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select recommendation" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {recommendations.map((rec) => (
          <SelectItem key={rec.code} value={rec.code} className="text-left">
            <div className="w-full">
              <div className="font-medium text-sm">{rec.code}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {rec.description.substring(0, 100)}...
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}