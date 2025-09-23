import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Lightbulb, Tag, Award, Calendar } from 'lucide-react';

// Mock data for demo purposes - TODO: remove mock functionality
const submissionData = [
  { name: 'AI Story', value: 45, color: '#3b82f6' },
  { name: 'AI Idea', value: 62, color: '#10b981' },
  { name: 'AI Solution', value: 38, color: '#f59e0b' },
];

const componentData = [
  { component: 'Frontend', count: 25 },
  { component: 'AI/ML', count: 42 },
  { component: 'Backend', count: 18 },
  { component: 'Data', count: 15 },
  { component: 'Product', count: 12 },
  { component: 'Other', count: 8 },
];

const timelineData = [
  { time: '09:00', submissions: 5 },
  { time: '10:00', submissions: 12 },
  { time: '11:00', submissions: 18 },
  { time: '12:00', submissions: 8 },
  { time: '13:00', submissions: 15 },
  { time: '14:00', submissions: 22 },
  { time: '15:00', submissions: 28 },
  { time: '16:00', submissions: 35 },
];

const topContributors = [
  { name: 'Sarah Chen', count: 8 },
  { name: 'Alex Rodriguez', count: 6 },
  { name: 'Jordan Kim', count: 5 },
  { name: 'Taylor Swift', count: 4 },
  { name: 'Morgan Lee', count: 4 },
];

const trendingTags = [
  { tag: 'automation', count: 28 },
  { tag: 'productivity', count: 24 },
  { tag: 'innovation', count: 22 },
  { tag: 'efficiency', count: 18 },
  { tag: 'collaboration', count: 15 },
];

export default function AnalyticsDashboard() {
  const totalSubmissions = submissionData.reduce((sum, item) => sum + item.value, 0);

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
            <div className="text-2xl font-bold" data-testid="text-total-submissions">{totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contributors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-contributors">89</div>
            <p className="text-xs text-muted-foreground">
              59% of attendees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trending Type</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-trending">AI Idea</div>
            <p className="text-xs text-muted-foreground">
              62 submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-peak-hour">4:00 PM</div>
            <p className="text-xs text-muted-foreground">
              35 submissions
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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={submissionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {submissionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Component Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Ideas by Component</CardTitle>
            <CardDescription>Which areas are getting the most attention</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={componentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="component" />
                <YAxis />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timelineData}>
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
            {topContributors.map((contributor, index) => (
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
            ))}
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
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag) => (
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
        </CardContent>
      </Card>
    </div>
  );
}