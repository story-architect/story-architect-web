import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Pages
import Dashboard from './pages/Dashboard';
import CreateStory from './pages/CreateStory';
import StoryDetail from './pages/StoryDetail';
import CreateCharacter from './pages/CreateCharacter';
import CreateRelationship from './pages/CreateRelationship';
import CharacterDiscovery from './pages/CharacterDiscovery';
import PatternEmerging from './pages/PatternEmerging';
import CharacterReport from './pages/CharacterReport';
import RelationshipDiscovery from './pages/RelationshipDiscovery';
import RelationshipReport from './pages/RelationshipReport';

// Layout
import { AppLayout } from './components/layout/AppLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/stories/new" element={<CreateStory />} />
                <Route path="/stories/:storyId" element={<StoryDetail />} />
                <Route path="/stories/:storyId/characters/new" element={<CreateCharacter />} />
                <Route path="/stories/:storyId/relationships/new" element={<CreateRelationship />} />
                <Route path="/characters/:characterId/discovery" element={<CharacterDiscovery />} />
                <Route path="/characters/:characterId/pattern-emerging" element={<PatternEmerging />} />
                <Route path="/characters/:characterId/report" element={<CharacterReport />} />
                <Route path="/relationships/:relationshipId/discovery" element={<RelationshipDiscovery />} />
                <Route path="/relationships/:relationshipId/report" element={<RelationshipReport />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
