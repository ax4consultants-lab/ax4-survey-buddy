import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  risk: 'Low' | 'Medium' | 'High';
  className?: string;
}

export const RiskBadge = ({ risk, className }: RiskBadgeProps) => {
  const getRiskStyles = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-risk-low text-white';
      case 'Medium':
        return 'bg-risk-medium text-white';
      case 'High':
        return 'bg-risk-high text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Badge className={cn(getRiskStyles(risk), className)}>
      {risk}
    </Badge>
  );
};