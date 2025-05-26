 # Next.js移行手順書

## 1. 移行の目的

- より堅牢なフレームワークへの移行
- AI連携機能の実装を容易にする
- パフォーマンスとSEOの向上
- より良い開発体験の提供

## 2. 移行前の準備

### 2.1 必要なツール
```bash
# Node.js 18.17.0以上が必要
node -v

# パッケージマネージャー（npm or yarn）
npm -v
# または
yarn -v
```

### 2.2 環境変数の整理
- 現在の`.env`ファイルの内容をバックアップ
- 新しい環境変数ファイルのテンプレートを作成

## 3. 新規プロジェクトの作成

```bash
# 新しいNext.jsプロジェクトの作成
npx create-next-app@latest shift-management-next --typescript --tailwind --app --src-dir --import-alias "@/*"

# 必要なパッケージのインストール
cd shift-management-next
npm install @radix-ui/react-icons lucide-react date-fns
npm install -D @types/node @types/react @types/react-dom typescript
```

## 4. プロジェクト構造の移行

### 4.1 ディレクトリ構造
```
shift-management-next/
├── src/
│   ├── app/
│   │   ├── (routes)/
│   │   │   ├── work-report/
│   │   │   │   └── page.tsx
│   │   │   ├── staff/
│   │   │   │   └── my-page/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── ai/
│   │   │   │   └── route.ts
│   │   │   └── notifications/
│   │   │       └── route.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── work-report/
│   │   └── staff/
│   └── lib/
└── public/
```

### 4.2 ファイルの移行手順

1. **コンポーネントの移行**
   ```bash
   # 既存のコンポーネントを新しい構造にコピー
   cp -r admin-web/src/components/* shift-management-next/src/components/
   ```

2. **ページの移行**
   ```bash
   # 既存のページを新しい構造にコピー
   mkdir -p shift-management-next/src/app/(routes)/work-report
   mkdir -p shift-management-next/src/app/(routes)/staff/my-page
   cp admin-web/src/pages/WorkReportPage.tsx shift-management-next/src/app/(routes)/work-report/page.tsx
   cp admin-web/src/pages/StaffMyPage.tsx shift-management-next/src/app/(routes)/staff/my-page/page.tsx
   ```

3. **スタイルの移行**
   ```bash
   # グローバルスタイルの移行
   cp admin-web/src/index.css shift-management-next/src/app/globals.css
   ```

## 5. コードの修正

### 5.1 ページコンポーネントの修正

1. **WorkReportPage.tsxの修正**
```typescript
// src/app/(routes)/work-report/page.tsx
'use client';  // クライアントコンポーネントとして指定

import { useState } from 'react';
// ... 他のインポート

export default function WorkReportPage() {
  // ... 既存のコード
}
```

2. **StaffMyPage.tsxの修正**
```typescript
// src/app/(routes)/staff/my-page/page.tsx
'use client';  // クライアントコンポーネントとして指定

import { useState } from 'react';
// ... 他のインポート

export default function StaffMyPage() {
  // ... 既存のコード
}
```

### 5.2 レイアウトの設定

```typescript
// src/app/layout.tsx
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'シフト管理システム',
  description: '小規模事業者向けシフト管理ツール',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### 5.3 API Routesの作成

```typescript
// src/app/api/ai/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    // AI処理の実装
    return NextResponse.json({ response: 'AI response' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

## 6. 型定義の修正

### 6.1 共通の型定義

```typescript
// src/types/index.ts
export interface DateRange {
  from: Date;
  to: Date;
}

export interface WorkRecord {
  date: Date;
  startTime: string;
  endTime: string;
  breakTime: string;
  totalHours: number;
  status: "normal" | "overtime" | "late" | "early";
  notes?: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  date: Date;
  isRead: boolean;
  type: "info" | "warning" | "important";
}
```

## 7. 動作確認

1. **開発サーバーの起動**
```bash
npm run dev
```

2. **確認項目**
- 各ページの表示
- コンポーネントの動作
- スタイルの適用
- ルーティングの動作

## 8. 今後の開発計画

### 8.1 優先度の高いタスク
1. AI連携機能の実装
2. サーバーサイドレンダリングの最適化
3. API Routesの実装
4. エラーハンドリングの強化

### 8.2 考慮すべき点
- パフォーマンスの最適化
- SEO対策
- アクセシビリティ
- セキュリティ

## 9. トラブルシューティング

### 9.1 よくある問題と解決方法

1. **コンポーネントの読み込みエラー**
   - `'use client'`ディレクティブの確認
   - インポートパスの確認

2. **スタイルの適用問題**
   - Tailwind CSSの設定確認
   - グローバルスタイルの読み込み確認

3. **API Routesのエラー**
   - ルートハンドラーの実装確認
   - レスポンス形式の確認

## 10. 参考リソース

- [Next.js公式ドキュメント](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app/building-your-application/routing)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Tailwind CSS with Next.js](https://tailwindcss.com/docs/guides/nextjs)