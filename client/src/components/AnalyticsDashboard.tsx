import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Lightbulb, Tag, Award, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

// Statistics API response type
interface StatisticsData {
  totalIdeas: number;
  todaySubmissions: number;
  activeContributors: number;
  hourlySubmissions: Array<{ hour: string; submissions: number }>;
  submissionTypes: Array<{ type: string; count: number }>;
  componentCounts: Array<{ component: string; count: number }>;
  topContributors: Array<{ name: string; count: number }>;
  trendingTags: Array<{ tag: string; count: number }>;
  lastResetAt: string;
}

// Color palette for charts
const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function AnalyticsDashboard() {
  // Fetch statistics data
  const { data: statistics, isLoading } = useQuery<StatisticsData>({
    queryKey: ['/api/statistics'],
    enabled: true,
    refetchOnMount: 'always', // Always refetch when tab is opened to ensure fresh data
  });

  // Derive chart data from statistics
  const totalIdeas = statistics?.totalIdeas ?? 0;
  const activeContributors = statistics?.activeContributors ?? 0;
  
  const submissionTypes = (statistics?.submissionTypes ?? []).map((item, index) => ({
    name: item.type,
    value: item.count,
    color: CHART_COLORS[index % CHART_COLORS.length]
  }));
  
  const trendingType = submissionTypes.length > 0 
    ? submissionTypes.reduce((max, current) => current.value > max.value ? current : max, submissionTypes[0])
    : { name: 'N/A', value: 0 };
  
  const hourlyData = (statistics?.hourlySubmissions ?? []).map(item => {
    // Normalize Postgres timestamp: "2025-01-01 14:00:00+00" -> "2025-01-01T14:00:00+00:00"
    const normalized = item.hour.replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00');
    return {
      time: new Date(normalized).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      submissions: item.submissions
    };
  });
  
  const peakHour = hourlyData.length > 0
    ? hourlyData.reduce((max, current) => current.submissions > max.submissions ? current : max, hourlyData[0])
    : { time: 'N/A', submissions: 0 };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ideas</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-total-submissions">{totalIdeas}</div>
            )}
            <p className="text-xs text-muted-foreground">
              All time submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contributors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-contributors">{activeContributors}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Unique contributors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trending Type</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mb-1" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-trending">{trendingType.name}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {isLoading ? <Skeleton className="h-3 w-20" /> : `${trendingType.value} submissions`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mb-1" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-peak-hour">{peakHour.time}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {isLoading ? <Skeleton className="h-3 w-20" /> : `${peakHour.submissions} submissions`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submission Types */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Types</CardTitle>
            <CardDescription>Distribution of idea types submitted</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : submissionTypes.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={submissionTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {submissionTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No submission type data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Component Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Ideas by Component</CardTitle>
            <CardDescription>Which areas are getting the most attention</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (statistics?.componentCounts ?? []).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statistics?.componentCounts ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="component" />
                  <YAxis />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No component data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline and Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submission Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Submission Timeline</CardTitle>
            <CardDescription>Ideas submitted throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : hourlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Line 
                    type="monotone" 
                    dataKey="submissions" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No timeline data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Contributors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Top Contributors
            </CardTitle>
            <CardDescription>Most active participants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-8" />
                </div>
              ))
            ) : (statistics?.topContributors ?? []).length > 0 ? (
              (statistics?.topContributors ?? []).map((contributor, index) => (
                <div key={contributor.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="text-sm font-medium" data-testid={`text-contributor-${index}`}>
                      {contributor.name}
                    </span>
                  </div>
                  <Badge variant="outline">{contributor.count}</Badge>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No contributors yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trending Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Trending Tags
          </CardTitle>
          <CardDescription>Most popular tags being used</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-6 w-24" />
              ))}
            </div>
          ) : (statistics?.trendingTags ?? []).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {(statistics?.trendingTags ?? []).map((tag) => (
                <Badge 
                  key={tag.tag} 
                  variant="secondary" 
                  className="text-sm"
                  data-testid={`badge-tag-${tag.tag}`}
                >
                  {tag.tag} ({tag.count})
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No trending tags yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}