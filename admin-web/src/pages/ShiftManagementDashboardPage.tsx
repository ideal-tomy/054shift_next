import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils"; // cnユーティリティをインポート
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import StaffingSummaryChart from '@/components/StaffingSummaryChart'; // 作成したコンポーネントをインポート
import { Locale } from 'date-fns'; // Import Locale type
import { Calendar as BigCalendar, dateFnsLocalizer, Event as CalendarEvent } from 'react-big-calendar';
import { format as dateFnsFormat, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ja } from 'date-fns/locale'; // Import Japanese locale
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

// シフトリクエストの型定義
export type ShiftRequestItem = {
  id: string;
  date: string; // YYYY-MM-DD
  staffName: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status: 'pending' | 'approved' | 'rejected';
};

// 初期モックデータ（後でstateに格納）
const initialMockShiftRequests: ShiftRequestItem[] = [
  { id: '1', date: '2025-05-28', staffName: '山田 太郎', startTime: '09:00', endTime: '17:00', status: 'pending' },
  { id: '2', date: '2025-05-28', staffName: '佐藤 花子', startTime: '13:00', endTime: '22:00', status: 'approved' },
  { id: '3', date: '2025-05-29', staffName: '鈴木 一郎', startTime: '18:00', endTime: '23:00', status: 'pending' },
  { id: '4', date: '2025-05-29', staffName: '高橋 次郎', startTime: '09:00', endTime: '15:00', status: 'rejected' },
  { id: '5', date: '2025-05-30', staffName: '田中 三郎', startTime: '10:00', endTime: '18:00', status: 'pending' },
];

const ShiftManagementDashboardPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 7)),
  });
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [shiftRequests, setShiftRequests] = useState<ShiftRequestItem[]>(initialMockShiftRequests);

  const locales = {
    'ja-JP': ja,
  };

  const localizer = dateFnsLocalizer({ // LINT_FIX_ID: 93c30d8d-bbbd-4c37-81ea-559c1bae34ab, 04f904bb-018e-49cb-85f7-2932b45e533e, 896cb415-c0e2-46dd-a240-6a633873f4ed, b5d8a3ab-3062-41fd-83a7-0ffb79afa81b, b7ec7c3f-36b3-4b3b-b0ac-a9a2feb945d9
    format: (date: Date, formatStr: string, options?: { locale?: Locale }) => dateFnsFormat(date, formatStr, { locale: options?.locale || ja }),
    parse,
    startOfWeek: (date: Date, options?: { locale?: Locale, weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 }) => startOfWeek(date, { locale: options?.locale || ja, weekStartsOn: options?.weekStartsOn }),
    getDay,
    locales,
  });

  const calendarEvents: CalendarEvent[] = shiftRequests.map(req => {
    const [year, month, day] = req.date.split('-').map(Number);
    const [startHour, startMinute] = req.startTime.split(':').map(Number);
    const [endHour, endMinute] = req.endTime.split(':').map(Number);
    return {
      title: `${req.staffName} (${req.startTime}-${req.endTime}) - ${req.status === 'pending' ? '申請中' : req.status === 'approved' ? '承認済' : '却下済'}`, // Include status in title
      start: new Date(year, month - 1, day, startHour, startMinute),
      end: new Date(year, month - 1, day, endHour, endMinute),
      allDay: false, // Assuming shifts are not all-day events
      resource: req, // Optionally, attach the original request for more details
    };
  });

  const handleApproveShift = (shiftId: string) => {
    setShiftRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === shiftId ? { ...req, status: 'approved' } : req
      )
    );
  };

  const handleRejectShift = (shiftId: string) => {
    setShiftRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === shiftId ? { ...req, status: 'rejected' } : req
      )
    );
  };
  return (
    <div className="container mx-auto p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">シフト管理ダッシュボード</h1>
      </header>

      {/* コントロールパネルエリア */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border rounded-lg shadow-sm">
        <div className="md:col-span-1">
          <h2 className="text-lg font-semibold mb-2">コントロールパネル</h2>
          {/* 日付範囲セレクター */}
          <div className="mb-4">
            <h3 className="text-md font-semibold mb-1">期間選択</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {
                    dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} - {" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>日付を選択</span>
                    )
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <div className="mt-2 flex space-x-2">
              <Button size="sm" variant="outline" onClick={() => setDateRange({ from: new Date(), to: new Date() })}>今日</Button>
              <Button size="sm" variant="outline" onClick={() => setDateRange({ from: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + (new Date().getDay() === 0 ? -6 : 1))), to: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 7)) })}>今週</Button>
              <Button size="sm" variant="outline" onClick={() => { const today = new Date(); const firstDay = new Date(today.getFullYear(), today.getMonth(), 1); const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0); setDateRange({ from: firstDay, to: lastDay }); }}>今月</Button>
            </div>
          </div>

          {/* 表示モード切替 */}
          <div>
            <h3 className="text-md font-semibold mb-1">表示モード</h3>
            <ToggleGroup type="single" value={viewMode} onValueChange={(value: 'list' | 'calendar' | '') => { if (value) setViewMode(value); }} className="w-full">
              <ToggleGroupItem value="list" aria-label="List view" className="w-1/2">
                リスト表示
              </ToggleGroupItem>
              <ToggleGroupItem value="calendar" aria-label="Calendar view" className="w-1/2">
                カレンダー表示
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-2">人手サマリー (プレースホルダー)</h2>
          {/* 人手サマリーのグラフなどをここに配置 */}
          <div className="p-4 bg-stone-50 rounded-md min-h-[320px]">
              <StaffingSummaryChart 
                shiftRequests={shiftRequests} 
                dateRange={dateRange} 
                dailyTargetStaffCount={2} // 例: 1日に2人体制が目標
                averageHoursPerStaff={8}  // 例: 1人あたり平均8時間勤務
              />
            </div>
        </div>
      </div>

      {/* データ表示エリア */}
      <div>
        <h2 className="text-lg font-semibold mb-2">シフト希望一覧 / カレンダー表示</h2>
        {/* シフト一覧テーブルやカレンダーなどをここに配置 */}
        <div className="p-4 bg-stone-100 rounded-md min-h-[300px] flex items-center justify-center">
          {viewMode === 'list' ? (
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox id="selectAllRows" aria-label="Select all rows" />
                </TableHead>
                <TableHead>日付</TableHead>
                <TableHead>スタッフ名</TableHead>
                <TableHead>希望時間</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead className="text-right">アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shiftRequests.filter(req => {
                if (!dateRange?.from) return true; 
                const reqDate = new Date(req.date);
                const fromDate = new Date(dateRange.from);
                fromDate.setHours(0,0,0,0); 
                const toDate = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
                toDate.setHours(23,59,59,999); 
                return reqDate >= fromDate && reqDate <= toDate;
              }).map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <Checkbox id={`select-${request.id}`} aria-label={`Select row ${request.id}`} />
                  </TableCell>
                  <TableCell>{format(new Date(request.date), "MM/dd (E)", { locale: ja })}</TableCell>
                  <TableCell>{request.staffName}</TableCell>
                  <TableCell>{request.startTime} - {request.endTime}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        request.status === 'approved' ? 'default' :
                        request.status === 'rejected' ? 'destructive' :
                        'secondary'
                      }
                      className={cn(
                        request.status === 'approved' && 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200',
                        request.status === 'pending' && 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200',
                        // 'destructive' variant handles its own styling
                      )}
                    >
                      {request.status === 'pending' ? '申請中' :
                       request.status === 'approved' ? '承認済' :
                       '却下済'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {request.status === 'pending' && (
                      <>
                        <Button size="sm" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 focus-visible:ring-green-400" onClick={() => handleApproveShift(request.id)}>
                          承認
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 focus-visible:ring-red-400" onClick={() => handleRejectShift(request.id)}>
                          却下
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          ) : (
            <div style={{ height: '600px' }}> {/* Ensure the calendar has enough height */} 
              <BigCalendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                culture='ja-JP' // Set culture to Japanese
                messages={{
                  allDay: '終日',
                  previous: '前',
                  next: '次',
                  today: '今日',
                  month: '月',
                  week: '週',
                  day: '日',
                  agenda: '予定リスト',
                  date: '日付',
                  time: '時間',
                  event: 'イベント',
                  noEventsInRange: 'この範囲に予定はありません。',
                  showMore: total => `他 ${total} 件`
                }}
                // Custom event styling based on status
                eventPropGetter={(event) => {
                  const originalRequest = event.resource as ShiftRequestItem;
                  let newStyle = {
                    backgroundColor: "gray",
                    color: 'black',
                    borderRadius: "5px",
                    border: "none"
                  };
                  if (originalRequest.status === 'approved') {
                    newStyle.backgroundColor = '#dcfce7'; // green-100
                    newStyle.color = '#166534'; // green-700
                    newStyle.border = '1px solid #86efac'; // green-300
                  } else if (originalRequest.status === 'pending') {
                    newStyle.backgroundColor = '#fef9c3'; // yellow-100
                    newStyle.color = '#854d0e'; // yellow-700
                    newStyle.border = '1px solid #fde047'; // yellow-300
                  } else if (originalRequest.status === 'rejected') {
                    newStyle.backgroundColor = '#fee2e2'; // red-100
                    newStyle.color = '#991b1b'; // red-700
                    newStyle.border = '1px solid #fca5a5'; // red-300
                  }
                  return {
                    className: "",
                    style: newStyle
                  };
                }}
              />
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ShiftManagementDashboardPage;
