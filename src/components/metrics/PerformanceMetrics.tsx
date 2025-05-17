'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { PerformanceMetrics as PerformanceMetricsType } from '@/types/agent';
import { supabase } from '@/lib/supabase';

export default function PerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetricsType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .order('last_updated', { ascending: false });

      if (error) throw error;
      setMetrics(data || []);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  const completionRateData = metrics.map((metric) => ({
    name: metric.agentId,
    completionRate: (metric.tasksCompleted / (metric.tasksCompleted + metric.failedTasks)) * 100,
  }));

  const responseTimeData = metrics.map((metric) => ({
    name: metric.agentId,
    averageTime: metric.averageCompletionTime,
  }));

  return (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Total Tasks Completed
          </Typography>
          <Typography variant="h4">
            {metrics.reduce((sum, m) => sum + m.tasksCompleted, 0)}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Average Success Rate
          </Typography>
          <Typography variant="h4">
            {Math.round(
              metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length
            )}%
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Average Response Time
          </Typography>
          <Typography variant="h4">
            {Math.round(
              metrics.reduce((sum, m) => sum + m.averageCompletionTime, 0) /
                metrics.length
            )}ms
          </Typography>
        </Paper>
      </Grid>

      {/* Charts */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Task Completion Rate by Agent
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={completionRateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completionRate" fill="#8884d8" name="Completion Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Average Response Time by Agent
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="averageTime"
                stroke="#82ca9d"
                name="Response Time (ms)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
} 