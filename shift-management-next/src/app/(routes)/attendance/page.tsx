'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { DateRange } from "react-day-picker";

export default function AttendancePage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">勤怠管理</h1>
        <div className="flex gap-4">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <Button>
            <Clock className="mr-2 h-4 w-4" />
            打刻
          </Button>
        </div>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">日次</TabsTrigger>
          <TabsTrigger value="monthly">月次</TabsTrigger>
          <TabsTrigger value="corrections">修正申請</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>日次勤怠</CardTitle>
            </CardHeader>
            <CardContent>
              <p>日次勤怠テーブルをここに実装予定</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>月次勤怠</CardTitle>
            </CardHeader>
            <CardContent>
              <p>月次勤怠テーブルをここに実装予定</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="corrections">
          <Card>
            <CardHeader>
              <CardTitle>修正申請</CardTitle>
            </CardHeader>
            <CardContent>
              <p>修正申請テーブルをここに実装予定</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 