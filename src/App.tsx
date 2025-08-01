import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NewSurvey from "./pages/NewSurvey";
import SurveyDetail from "./pages/SurveyDetail";
import AddRoom from "./pages/AddRoom";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import RoomDetail from "./pages/RoomDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new-survey" element={<NewSurvey />} />
          <Route path="/survey/:surveyId" element={<SurveyDetail />} />
          <Route path="/survey/:surveyId/add-room" element={<AddRoom />} />
          <Route path="/survey/:surveyId/room/:roomId" element={<RoomDetail />} />
          <Route path="/survey/:surveyId/add-item" element={<AddItem />} />
          <Route path="/survey/:surveyId/edit-item/:itemId" element={<EditItem />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
