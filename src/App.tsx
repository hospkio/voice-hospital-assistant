
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Kiosk from '@/pages/Kiosk';
import EnhancedKiosk from '@/pages/EnhancedKiosk';
import VoiceTestPage from '@/pages/VoiceTestPage';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background font-sans antialiased">
          <Toaster />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/kiosk" element={<Kiosk />} />
            <Route path="/enhanced-kiosk" element={<EnhancedKiosk />} />
            <Route path="/voice-test" element={<VoiceTestPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
