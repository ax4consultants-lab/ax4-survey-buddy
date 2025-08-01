import { ArrowLeft, Home, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

interface NavigationProps {
  title: string;
  showBack?: boolean;
  showHome?: boolean;
  actions?: React.ReactNode;
}

export const Navigation = ({ title, showBack = false, showHome = false, actions }: NavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {showHome && location.pathname !== "/" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="p-2"
            >
              <Home className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {actions}
        </div>
      </div>
    </header>
  );
};