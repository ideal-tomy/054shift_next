import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ShiftRequest {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

// プリセットシフトの定義
const shiftPresets = [
  { label: '通し', startTime: '13:00', endTime: '23:00' },
  { label: '遅番', startTime: '18:00', endTime: '25:00' }, // 25:00 は翌日1:00の意味合いですが、Input type="time" は 23:59 までなので注意
  { label: '早番', startTime: '13:00', endTime: '22:00' },
  // 必要に応じて他のプリセットを追加
];


const ShiftSubmissionPage: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [submittedShifts, setSubmittedShifts] = useState<ShiftRequest[]>([]);

  const handlePresetClick = (presetStartTime: string, presetEndTime: string) => {
    setStartTime(presetStartTime);
    setEndTime(presetEndTime);
  };

  const handleSubmit = () => {
    // (handleSubmitのロジックは変更なし)
    if (date && startTime && endTime) {
      const newShiftRequest: ShiftRequest = {
        id: uuidv4(),
        date: format(date, 'yyyy-MM-dd'),
        startTime,
        endTime,
      };
      setSubmittedShifts([...submittedShifts, newShiftRequest]);
      console.log('提出済みシフト:', [...submittedShifts, newShiftRequest]);
      alert(`シフト希望を提出しました:\n日付: ${format(date, 'yyyy/MM/dd')}\n開始: ${startTime}\n終了: ${endTime}`);
      setDate(new Date());
      setStartTime('');
      setEndTime('');
    } else {
      let errorMessage = '以下の情報を入力してください:\n';
      if (!date) errorMessage += '- 日付\n';
      if (!startTime) errorMessage += '- 開始時刻\n';
      if (!endTime) errorMessage += '- 終了時刻\n';
      alert(errorMessage);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">シフト希望提出</h1>

      <div className="space-y-6">
        <div>
          {/* 日付ピッカー (変更なし) */}
          <Label htmlFor="date-picker" className="block text-sm font-medium text-gray-700 mb-1">
            日付 <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date-picker"
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>日付を選択</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* プリセットボタンセクション */}
        <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700">
                シフトパターン
            </Label>
            <div className="flex flex-wrap gap-2">
                {shiftPresets.map((preset) => (
                <Button
                    key={preset.label}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetClick(preset.startTime, preset.endTime)}
                >
                    {preset.label} ({preset.startTime}-{preset.endTime === '25:00' ? '翌1:00' : preset.endTime})
                </Button>
                ))}
            </div>
        </div>

        <div>
          <Label htmlFor="start-time" className="block text-sm font-medium text-gray-700 mb-1">
            開始時刻 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full"
            required
          />
        </div>

        <div>
          <Label htmlFor="end-time" className="block text-sm font-medium text-gray-700 mb-1">
            終了時刻 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="end-time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full"
            required
          />
        </div>

        <Button onClick={handleSubmit} className="w-full">
          希望を提出する
        </Button>
      </div>

      {/* 提出済みシフトの簡易表示 (変更なし) */}
      {submittedShifts.length > 0 && (
        <div className="mt-8 pt-4 border-t">
          <h2 className="text-xl font-semibold mb-2">提出済みシフト希望</h2>
          <ul className="list-disc pl-5">
            {submittedShifts.map((shift) => (
              <li key={shift.id}>
                {shift.date} : {shift.startTime} - {shift.endTime}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ShiftSubmissionPage;
