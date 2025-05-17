'use client';

import { useState } from 'react';
import { Box, Container, Grid, Typography, Paper, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Add as AddIcon } from '@mui/icons-material';
import AgentList from '@/components/agents/AgentList';
import AgentForm from '@/components/agents/AgentForm';
import TaskList from '@/components/tasks/TaskList';
import TaskForm from '@/components/tasks/TaskForm';
import PerformanceMetrics from '@/components/metrics/PerformanceMetrics';

const DashboardPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

export default function Home() {
  const [isAgentFormOpen, setIsAgentFormOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Agent Collaboration Hub
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsTaskFormOpen(true)}
              >
                Create Task
              </Button>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setIsAgentFormOpen(true)}
              >
                Register Agent
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Active Agents */}
        <Grid item xs={12} md={6}>
          <DashboardPaper>
            <Typography variant="h6" gutterBottom>
              Active Agents
            </Typography>
            <AgentList />
          </DashboardPaper>
        </Grid>

        {/* Task Queue */}
        <Grid item xs={12} md={6}>
          <DashboardPaper>
            <Typography variant="h6" gutterBottom>
              Task Queue
            </Typography>
            <TaskList />
          </DashboardPaper>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12}>
          <DashboardPaper>
            <Typography variant="h6" gutterBottom>
              Performance Metrics
            </Typography>
            <PerformanceMetrics />
          </DashboardPaper>
        </Grid>
      </Grid>

      <AgentForm
        open={isAgentFormOpen}
        onClose={() => setIsAgentFormOpen(false)}
        onSuccess={() => {
          setIsAgentFormOpen(false);
          // Refresh agent list
        }}
      />

      <TaskForm
        open={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        onSuccess={() => {
          setIsTaskFormOpen(false);
          // Refresh task list
        }}
      />
    </Container>
  );
} 