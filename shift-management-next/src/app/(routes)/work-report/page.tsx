'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { DateRange } from "react-day-picker";

export default function WorkReportPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">勤務実績レポート</h1>
        <div className="flex gap-4">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            CSV出力
          </Button>
        </div>
      </div>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">サマリー</TabsTrigger>
          <TabsTrigger value="details">詳細</TabsTrigger>
          <TabsTrigger value="corrections">修正履歴</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">総労働時間</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">120時間</div>
                <p className="text-xs text-muted-foreground">
                  前月比 +10%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">出勤日数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15日</div>
                <p className="text-xs text-muted-foreground">
                  前月比 +2日
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">平均勤務時間</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8時間</div>
                <p className="text-xs text-muted-foreground">
                  前月比 +0.5時間
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">法定労働時間超過</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">2時間</div>
                <p className="text-xs text-muted-foreground">
                  前月比 +1時間
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>勤務詳細</CardTitle>
            </CardHeader>
            <CardContent>
              <p>勤務詳細テーブルをここに実装予定</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="corrections">
          <Card>
            <CardHeader>
              <CardTitle>勤怠修正履歴</CardTitle>
            </CardHeader>
            <CardContent>
              <p>修正履歴テーブルをここに実装予定</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 