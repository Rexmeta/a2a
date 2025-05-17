import { Box, Container, Typography } from '@mui/material';
import TaskList from '@/components/tasks/TaskList';
import AgentList from '@/components/agents/AgentList';
import { useState } from 'react';

export default function Home() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Agent Nest - A2A Task Management
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ flex: 1 }}>
            <AgentList
              onSelectAgent={setSelectedAgent}
              selectedAgent={selectedAgent}
            />
          </Box>
          
          <Box sx={{ flex: 2 }}>
            <TaskList selectedAgent={selectedAgent} />
          </Box>
        </Box>
      </Box>
    </Container>
  );
} 