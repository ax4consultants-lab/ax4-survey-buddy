import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, useEffect } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import LazyLoader from "@/components/LazyLoader";
import { clearExpiredDrafts } from "@/utils/draftStorage";

// Lazy load heavy components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const History = lazy(() => import("./pages/History"));
const NewSurvey = lazy(() => import("./pages/NewSurvey"));
const SurveyDetail = lazy(() => import("./pages/SurveyDetail"));
const AddRoom = lazy(() => import("./pages/AddRoom"));
const AddItem = lazy(() => import("./pages/AddItem"));
const EditItem = lazy(() => import("./pages/EditItem"));
const RoomDetail = lazy(() => import("./pages/RoomDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Clear expired drafts on app load
    clearExpiredDrafts();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LazyLoader><Dashboard /></LazyLoader>} />
              <Route path="/history" element={<LazyLoader><History /></LazyLoader>} />
              <Route path="/new-survey" element={<LazyLoader><NewSurvey /></LazyLoader>} />
              <Route path="/survey/:surveyId" element={<LazyLoader><SurveyDetail /></LazyLoader>} />
              <Route path="/survey/:surveyId/add-room" element={<LazyLoader><AddRoom /></LazyLoader>} />
              <Route path="/survey/:surveyId/room/:roomId" element={<LazyLoader><RoomDetail /></LazyLoader>} />
              <Route path="/survey/:surveyId/add-item" element={<LazyLoader><AddItem /></LazyLoader>} />
              <Route path="/survey/:surveyId/edit-item/:itemId" element={<LazyLoader><EditItem /></LazyLoader>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<LazyLoader><NotFound /></LazyLoader>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;
