'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AnalyticsData {
  queryCount: number;
  streak: number;
  badges: string[];
  rateLimit: {
    hourly: {
      used: number;
      limit: number;
    };
    daily: {
      used: number;
      limit: number;
    };
  };
}

export default function AnalyticsPanel() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    queryCount: 0,
    streak: 0,
    badges: [],
    rateLimit: {
      hourly: { used: 0, limit: 50 },
      daily: { used: 0, limit: 100 }
    }
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          setAnalytics({
            queryCount: userData.queryCount || 0,
            streak: userData.streak || 0,
            badges: userData.badges || [],
            rateLimit: {
              hourly: { used: userData.queryCount || 0, limit: 50 },
              daily: { used: userData.queryCount || 0, limit: 100 }
            }
          });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };
    
    fetchAnalytics();
    
    // Refresh every minute
    const interval = setInterval(fetchAnalytics, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Hourly Limit</span>
                <span className="text-sm font-medium">{analytics.rateLimit.hourly.used}/{analytics.rateLimit.hourly.limit}</span>
              </div>
              <Progress value={(analytics.rateLimit.hourly.used / analytics.rateLimit.hourly.limit) * 100} />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Daily Limit</span>
                <span className="text-sm font-medium">{analytics.rateLimit.daily.used}/{analytics.rateLimit.daily.limit}</span>
              </div>
              <Progress value={(analytics.rateLimit.daily.used / analytics.rateLimit.daily.limit) * 100} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Current Streak:</span>
              <span className="font-bold">{analytics.streak} days</span>
            </div>
            <div className="flex justify-between">
              <span>Total Queries:</span>
              <span className="font-bold">{analytics.queryCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Badges Earned:</span>
              <span className="font-bold">{analytics.badges.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}