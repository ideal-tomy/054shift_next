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
import { format as dateFnsFormat, parse as dateFnsParse, startOfWeek, getDay, isSameMonth as dateFnsIsSameMonth, differenceInMinutes as dateFnsDifferenceInMinutes } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import StaffingSummaryChart from '@/components/StaffingSummaryChart'; // 作成したコンポーネントをインポート
import { Locale } from 'date-fns'; // Import Locale type
import { Calendar as BigCalendar, dateFnsLocalizer, Event as CalendarEvent, DateCellWrapperProps } from 'react-big-calendar';
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
const STAFFING_LEVEL_THRESHOLDS = {
  SEVERE_SHORTAGE_BELOW_PERCENT: 0.5, // 50%未満で深刻な不足
  MODERATE_SHORTAGE_BELOW_PERCENT: 0.8, // 80%未満でやや不足 (50%以上)
  SLIGHT_SHORTAGE_BELOW_PERCENT: 1.0,   // 100%未満で軽微な不足 (80%以上)
  OVERSTAFFING_ABOVE_PERCENT: 1.2,    // 120%超で過剰
  // 100%以上120%以下は staffing-ok とする
};

const initialMockShiftRequests: ShiftRequestItem[] = [
  { id: '1', date: '2025-05-28', staffName: '山田 太郎', startTime: '09:00', endTime: '17:00', status: 'pending' },
  { id: '6', date: '2025-05-30', staffName: '伊藤 五郎', startTime: '08:00', endTime: '16:00', status: 'approved' },
  // Test data for May 12 (Staffing OK - target 24 hours)
  { id: '7', date: '2025-05-12', staffName: 'John Doe', startTime: '09:00', endTime: '17:00', status: 'approved' }, // 8 hours
  { id: '8', date: '2025-05-12', staffName: 'Jane Smith', startTime: '09:00', endTime: '17:00', status: 'approved' }, // 8 hours
  { id: '9', date: '2025-05-12', staffName: 'Mike Lee', startTime: '09:00', endTime: '17:00', status: 'approved' }, // 8 hours
  // Test data for May 13 (Overstaffing - target 24 hours)
  { id: '10', date: '2025-05-13', staffName: 'Alice Brown', startTime: '09:00', endTime: '17:00', status: 'approved' }, // 8 hours
  { id: '11', date: '2025-05-13', staffName: 'Bob Green', startTime: '09:00', endTime: '17:00', status: 'approved' }, // 8 hours
  { id: '12', date: '2025-05-13', staffName: 'Carol White', startTime: '09:00', endTime: '17:00', status: 'approved' }, // 8 hours
  { id: '13', date: '2025-05-13', staffName: 'David Black', startTime: '09:00', endTime: '17:00', status: 'approved' }, // 8 hours
  // Test data for May 14 (Slight Shortage - target 24 hours, achieved 20 hours)
  { id: '14', date: '2025-05-14', staffName: 'Eve Gray', startTime: '09:00', endTime: '17:00', status: 'approved' }, // 8 hours
  { id: '15', date: '2025-05-14', staffName: 'Frank Blue', startTime: '09:00', endTime: '17:00', status: 'approved' }, // 8 hours
  { id: '16', date: '2025-05-14', staffName: 'Grace Red', startTime: '09:00', endTime: '13:00', status: 'approved' }, // 4 hours
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
  const [dailyTargetStaffCount, setDailyTargetStaffCount] = useState<number>(3); // 目標スタッフ人数 (テストデータに合わせて3に変更)
  const [averageHoursPerStaff, setAverageHoursPerStaff] = useState<number>(8); // 平均勤務時間
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date()); // カレンダーの現在表示月

  const locales = {
    'ja-JP': ja,
  };

  const localizer = dateFnsLocalizer({
    format: (date: Date, formatStr: string, options?: { locale?: Locale }) => dateFnsFormat(date, formatStr, { locale: options?.locale || ja }),
    parse: (dateString: string, formatString: string, referenceDate: Date, options?: { locale?: Locale }) => dateFnsParse(dateString, formatString, referenceDate, { locale: options?.locale || ja }),
    startOfWeek: (date: Date, options?: { locale?: Locale, weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 }) => startOfWeek(date, { locale: options?.locale || ja, weekStartsOn: options?.weekStartsOn }),
    getDay,
    locales,
  });

// SimplifiedWrapperForDebug コンポーネントの定義
const MyDateCellWrapper: React.FC<
  DateCellWrapperProps & {
    shiftRequests: ShiftRequestItem[];
    dailyTargetStaffCount: number;
    averageHoursPerStaff: number;
    currentCalendarDateForCell: Date;
    staffingLevelThresholds: typeof STAFFING_LEVEL_THRESHOLDS;
  }
> = ({
  children,
  value: date, // This is the date for the cell
  shiftRequests,
  dailyTargetStaffCount,
  averageHoursPerStaff,
  currentCalendarDateForCell,
  staffingLevelThresholds,
}) => {
  console.log('MyDateCellWrapper CALLED FOR:', date);
  const formattedDate = dateFnsFormat(date, 'yyyy-MM-dd');

  const approvedShiftsOnDate = shiftRequests.filter(
    (req) => req.date === formattedDate && req.status === 'approved'
  );

  const totalActualHours = approvedShiftsOnDate.reduce((total, shift) => {
    // Assuming startTime and endTime are 'HH:mm' strings
    const start = dateFnsParse(shift.startTime, 'HH:mm', new Date());
    const end = dateFnsParse(shift.endTime, 'HH:mm', new Date());
    return total + dateFnsDifferenceInMinutes(end, start) / 60;
  }, 0);

  let staffingClassName = 'date-header-other-month'; // Default for days not in current month view

  if (currentCalendarDateForCell && dateFnsIsSameMonth(date, currentCalendarDateForCell)) {
    if (dailyTargetStaffCount <= 0 || averageHoursPerStaff <= 0) {
        staffingClassName = 'date-header-normal'; // Or some other default
    } else {
      const equivalentActualStaff = totalActualHours / averageHoursPerStaff;
      const staffingRatio = dailyTargetStaffCount > 0 ? equivalentActualStaff / dailyTargetStaffCount : 0; // Avoid division by zero if dailyTargetStaffCount is 0

      if (dailyTargetStaffCount <= 0) { // Handle cases where target is not set or invalid
        staffingClassName = 'date-header-normal'; // Or some other appropriate class
      } else if (staffingRatio < staffingLevelThresholds.SEVERE_SHORTAGE_BELOW_PERCENT) {
        staffingClassName = 'date-header-severe-shortage';
      } else if (staffingRatio < staffingLevelThresholds.MODERATE_SHORTAGE_BELOW_PERCENT) {
        staffingClassName = 'date-header-moderate-shortage';
      } else if (staffingRatio < staffingLevelThresholds.SLIGHT_SHORTAGE_BELOW_PERCENT) {
        staffingClassName = 'date-header-slight-shortage';
      } else if (staffingRatio <= staffingLevelThresholds.OVERSTAFFING_ABOVE_PERCENT) {
        staffingClassName = 'date-header-staffing-ok';
      } else { // staffingRatio > staffingLevelThresholds.OVERSTAFFING_ABOVE_PERCENT
        staffingClassName = 'date-header-overstaffing';
      }
    }
  }

  console.log(`MyDateCellWrapper for ${formattedDate}: Staffing Class: ${staffingClassName}`);

  // ルートのdivにクラス名とデバッグスタイルを適用
  // children（デフォルトのセル内容）をそのままレンダリング
  return (
    <div 
      className={staffingClassName} // 計算されたクラス名をここに適用
      style={{
        // border: '1px solid lightgray', // 必要であれば控えめな枠線を追加
        backgroundColor: 
          staffingClassName === 'date-header-severe-shortage' ? 'rgba(255, 100, 100, 0.2)' : // 緊急な人員不足 (より目立つ赤系)
          staffingClassName === 'date-header-moderate-shortage' ? 'rgba(255, 165, 0, 0.2)' :  // 中程度の人員不足 (オレンジ系)
          staffingClassName === 'date-header-slight-shortage' ? 'rgba(255, 255, 0, 0.2)' :    // 軽微な人員不足 (黄色系)
          staffingClassName === 'date-header-overstaffing' ? 'rgba(173, 216, 230, 0.3)' :  // 人員過剰 (水色系)
          staffingClassName === 'date-header-staffing-ok' ? 'rgba(144, 238, 144, 0.2)' :  // 適正 (薄緑系)
          staffingClassName === 'date-header-other-month' ? 'rgba(240, 240, 240, 0.1)' : // 当月外 (非常に薄いグレー)
          'rgba(211, 211, 211, 0.1)', // その他 (薄いグレー)
        height: '100%',
        width: '100%', 
        display: 'block', 
      }}
    >
      {children} 
    </div>
  );
};



  const eventStyleGetter = (event: any) => { // LINT_FIX_ID: bdd0903b-c241-41c7-927e-e08d14530664, 378edfe9-4310-4537-8739-69d705f2acf8, 9a727e94-79b2-4db6-a052-900928cf0d80
    const status = event.resource.status;
    let backgroundColor = '';
    let textColor = 'white'; // Default text color

    switch (status) {
      case 'approved':
        backgroundColor = '#22c55e'; // green-500
        break;
      case 'pending':
        backgroundColor = '#facc15'; // yellow-400
        textColor = '#374151'; // gray-700 for better contrast on yellow
        break;
      case 'rejected':
        backgroundColor = '#ef4444'; // red-500
        break;
      default:
        backgroundColor = '#3b82f6'; // blue-500 (default if status is unknown)
        break;
    }

    return {
      style: {
        backgroundColor,
        color: textColor,
        borderRadius: '5px',
        border: 'none',
        opacity: 0.9,
        display: 'block',
      },
    };
  };

  const calendarEvents: CalendarEvent[] = shiftRequests.map(req => {
    const [year, month, day] = req.date.split('-').map(Number);
    const [startHour, startMinute] = req.startTime.split(':').map(Number);
    const [endHour, endMinute] = req.endTime.split(':').map(Number);
    return {
      title: `${req.staffName} ${req.startTime}-${req.endTime}`,
      start: new Date(year, month - 1, day, startHour, startMinute),
      end: new Date(year, month - 1, day, endHour, endMinute),
      allDay: false,
      resource: req, // Pass the original request object for styling and actions
    };
  });

/*
  const dayPropGetter = (date: Date) => {
    const formattedDate = dateFnsFormat(date, 'yyyy-MM-dd');
    const approvedShiftsOnDate = shiftRequests.filter(
      (req) => req.date === formattedDate && req.status === 'approved'
    );

    // カレンダーが表示している月以外の日はデフォルトのスタイルを適用
    // (react-big-calendarがrbc-off-range-bgクラスを適用する)
    // Note: This ties coloring to the dateRange state, not necessarily the calendar's current view month.
    // For more sophisticated behavior, consider the calendar's own current view date.
    if (!dateRange || !dateRange.from || !isSameMonth(date, dateRange.from)) { // LINT_FIX_ID: c0c10833-a5b2-4e9f-a64a-158d9b7e1f7d
      // If dateRange or dateRange.from is not set, or if the date is not in the same month as dateRange.from,
      // apply default styling (or handle as appropriate for non-current-month days).
      // This also implicitly handles the case where the calendar view might be on a month different from dateRange.from.
      return { className: '' }; 
    }
    // Original logic using dateRange.from (now safe after the check above)
    // The check for isSameMonth is already handled by the condition above.

    let actualTotalHours = 0;
    approvedShiftsOnDate.forEach((req) => {
      const startTimeParts = req.startTime.split(':').map(Number);
      const endTimeParts = req.endTime.split(':').map(Number);
      const startDateTime = new Date(1970, 0, 1, startTimeParts[0], startTimeParts[1]);
      const endDateTime = new Date(1970, 0, 1, endTimeParts[0], endTimeParts[1]);
      // 日をまたぐシフトは考慮しないシンプルな計算
      actualTotalHours += differenceInHours(endDateTime, startDateTime);
    });

    const targetTotalHours = dailyTargetStaffCount * averageHoursPerStaff;
    // averageHoursPerStaffが0の場合のdivision by zeroを避ける
    const equivalentActualStaff = averageHoursPerStaff > 0 ? actualTotalHours / averageHoursPerStaff : 0;

    let customClassName = ''; // Use custom classes for more CSS control
    if (targetTotalHours > 0) { // 目標がある場合のみ評価
      if (equivalentActualStaff < dailyTargetStaffCount * STAFFING_LEVEL_THRESHOLDS.SEVERE_SHORTAGE_BELOW_PERCENT) {
        customClassName = 'day-severe-shortage';
      } else if (equivalentActualStaff < dailyTargetStaffCount * STAFFING_LEVEL_THRESHOLDS.MODERATE_SHORTAGE_BELOW_PERCENT) {
        customClassName = 'day-moderate-shortage';
      } else {
        customClassName = 'day-staffing-ok';
      }
    }

    return {
      className: customClassName,
    };
  };*/

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
                          {dateFnsFormat(dateRange.from, "LLL dd, y")} - {" "}
                          {dateFnsFormat(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        dateFnsFormat(dateRange.from, "LLL dd, y")
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
                dailyTargetStaffCount={dailyTargetStaffCount}
                averageHoursPerStaff={averageHoursPerStaff}
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
                  <TableCell>{dateFnsFormat(new Date(request.date), "MM/dd (E)", { locale: ja })}</TableCell>
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
                eventPropGetter={eventStyleGetter}
                // dayPropGetter={dayPropGetter} // Replaced by dateCellWrapper
                date={currentCalendarDate} // Control the displayed month
                onNavigate={(newDate) => setCurrentCalendarDate(newDate)} // Update state on month change
                components={{
                  dateCellWrapper: (props) => (
                    <MyDateCellWrapper
                      {...props}
                      shiftRequests={shiftRequests}
                      dailyTargetStaffCount={dailyTargetStaffCount}
                      averageHoursPerStaff={averageHoursPerStaff}
                      currentCalendarDateForCell={currentCalendarDate}
                      staffingLevelThresholds={STAFFING_LEVEL_THRESHOLDS}
                    />
                  ),
                  // event: EventComponent, // Keep commented out for now. If custom event display is needed later, define and use it.
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
