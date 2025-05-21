import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { format, eachDayOfInterval, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ShiftRequestItem } from '@/pages/ShiftManagementDashboardPage'; // 型をインポート
import { DateRange } from 'react-day-picker';

interface StaffingDataPoint {
  date: string; // MM/dd (E)
  actualHours: number;       // 実績総時間
  targetStaffHours: number; // 目標総時間 (目標人数 * 平均勤務時間)
  actualStaffCount: number; // 実出勤者数
}

interface StaffingSummaryChartProps {
  shiftRequests: ShiftRequestItem[];
  dateRange: DateRange | undefined;
  dailyTargetStaffCount?: number; // 1日あたりの目標スタッフ人数
  averageHoursPerStaff?: number; // 1人あたりの平均勤務時間
}

const StaffingSummaryChart: React.FC<StaffingSummaryChartProps> = ({ 
  shiftRequests,
  dateRange,
  dailyTargetStaffCount = 2, // デフォルトの目標スタッフ人数
  averageHoursPerStaff = 8,  // デフォルトの1人あたり平均勤務時間
}) => {
  if (!dateRange?.from) {
    return <p className="text-sm text-gray-500 text-center p-4">日付範囲を選択してください。</p>;
  }

  const start = dateRange.from;
  const end = dateRange.to || dateRange.from; // toがない場合はfromと同じ日

  const daysInInterval = eachDayOfInterval({ start, end });

  const chartData: StaffingDataPoint[] = daysInInterval.map(day => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    let actualHours = 0;

    shiftRequests.forEach(req => {
      if (req.date === formattedDay && req.status === 'approved') {
        const startTime = parseISO(`1970-01-01T${req.startTime}:00`);
        const endTime = parseISO(`1970-01-01T${req.endTime}:00`);
        const diffMilliseconds = endTime.getTime() - startTime.getTime();
        actualHours += diffMilliseconds / (1000 * 60 * 60); // 時間に変換
      }
    });

    const approvedShiftsForDay = shiftRequests.filter(
      (req) => req.date === formattedDay && req.status === 'approved'
    );
    const uniqueStaffNames = new Set(approvedShiftsForDay.map(req => req.staffName));
    const actualStaffCount = uniqueStaffNames.size;

    const targetStaffHours = dailyTargetStaffCount * averageHoursPerStaff;

    return {
      date: format(day, 'MM/dd (E)', { locale: ja }),
      actualHours,
      targetStaffHours,
      actualStaffCount,
    };
  });

  if (chartData.length === 0) {
    return <p className="text-sm text-gray-500 text-center p-4">選択範囲にデータがありません。</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart
        data={chartData}
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: -10, // Y軸ラベルのスペースを調整
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis 
          yAxisId="left" // Now for People
          orientation="left"
          label={{ value: '人数', angle: -90, position: 'insideLeft', offset: 10, fontSize: 12 }}
          tick={{ fontSize: 12 }}
          allowDecimals={false} // People should be integers
        />
        <YAxis 
          yAxisId="right" // Now for Time
          orientation="right"
          label={{ value: '時間', angle: -90, position: 'insideRight', offset: 10, fontSize: 12 }}
          tick={{ fontSize: 12 }}
          domain={[0, 20]} // Fix Y-axis domain from 0 to 20 hours
        />
        <Tooltip 
          formatter={(value: number, name: string) => {
            if (name === 'actualHours') return [`${value.toFixed(1)} 時間`, '実績時間'];
            if (name === 'targetStaffHours') return [`${value.toFixed(1)} 時間`, '目標時間'];
            if (name === 'actualStaffCount') return [`${value.toFixed(0)} 人`, '出勤人数']; // 人数は整数表示
            return [value, name];
          }}
        />
        <Legend 
          formatter={(value) => {
            if (value === 'actualHours') return '実績時間';
            if (value === 'targetStaffHours') return '目標時間';
            if (value === 'actualStaffCount') return '出勤人数';
            return value;
          }}
          wrapperStyle={{ fontSize: '12px' }}
        />
        <Bar dataKey="actualHours" name="実績時間" yAxisId="right" fill="#8884d8" barSize={20} />
        <Line type="monotone" dataKey="targetStaffHours" name="目標時間" yAxisId="right" stroke="#82ca9d" strokeWidth={2} dot={false} activeDot={false} />
        <Line type="monotone" dataKey="actualStaffCount" name="出勤人数" yAxisId="left" stroke="#ff0000" strokeWidth={2} />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default StaffingSummaryChart;
