import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button"; // shadcn/uiのButtonを想定
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // shadcn/uiのCardを想定

const DashboardPage: React.FC = () => {
  // ダミーデータや状態管理は後ほど実装
  const unapprovedShiftsCount = 5; // 例: 未承認シフト数
  const upcomingShortageAlert = "3日後に早番が1名不足しています"; // 例: 人員不足アラート
  const staffRequestsCount = 2; // 例: スタッフからの連絡

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">管理者ダッシュボード</h1>

      {/* クイックアクセス */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">クイックアクセス</h2>
        <div className="flex flex-wrap gap-4">
          <Button asChild variant="outline">
            <Link to="/staff">スタッフ管理</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/shift-submission">シフト希望提出 (確認用)</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/shift-dashboard">シフト管理</Link>
          </Button>
          {/* 必要に応じて他のページへのリンクを追加 */}
        </div>
      </section>

      {/* 主要KPI & アラートウィジェット */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 本日の出勤状況 */}
        <Card>
          <CardHeader>
            <CardTitle>本日の出勤状況</CardTitle>
            <CardDescription>リアルタイムの出勤情報を表示</CardDescription>
          </CardHeader>
          <CardContent>
            <p>予定: 10名 / 実績: 8名</p>
            <p className="text-red-500">不足: 2名</p>
            {/* 詳細表示や更新ボタンなどを配置 */}
          </CardContent>
        </Card>

        {/* 未承認のシフト申請 */}
        <Card>
          <CardHeader>
            <CardTitle>未承認のシフト申請</CardTitle>
            <CardDescription>対応が必要な申請があります</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{unapprovedShiftsCount} 件</p>
            <Button asChild size="sm" className="mt-2">
              <Link to="/shift-dashboard?filter=pending">詳細を確認</Link>
            </Button>
          </CardContent>
        </Card>

        {/* 近日中の人員不足アラート */}
        <Card>
          <CardHeader>
            <CardTitle>人員不足アラート</CardTitle>
            <CardDescription>早めの対応が必要です</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingShortageAlert ? (
              <p className="text-orange-600">{upcomingShortageAlert}</p>
            ) : (
              <p>現在、深刻な人員不足アラートはありません。</p>
            )}
            {/* 詳細確認へのリンク */}
          </CardContent>
        </Card>

        {/* スタッフからの連絡・申請通知 */}
        <Card>
          <CardHeader>
            <CardTitle>スタッフからの連絡</CardTitle>
            <CardDescription>休暇申請や勤怠修正依頼など</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{staffRequestsCount} 件の未読通知</p>
            {/* 通知一覧ページへのリンク */}
          </CardContent>
        </Card>

        {/* 月初からの主要KPI */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>主要KPIサマリー (今月)</CardTitle>
            <CardDescription>総実働時間、目標比、概算人件費など</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold">総実働時間</h4>
                <p>875 時間 (目標比: 98%)</p>
              </div>
              <div>
                <h4 className="font-semibold">概算人件費</h4>
                <p>¥1,250,000 (予算内)</p>
              </div>
              <div>
                <h4 className="font-semibold">平均稼働率</h4>
                <p>85%</p>
              </div>
            </div>
            {/* 詳細レポートページへのリンク */}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default DashboardPage;
