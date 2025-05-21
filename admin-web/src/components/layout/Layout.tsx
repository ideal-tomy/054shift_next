import React from 'react';
import { NavLink } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-sky-100 text-sky-700' // TailwindのSkyカラーパレットを使用 (例)
        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50"> {/* 背景色を薄いグレーに */}
      <header className="bg-white shadow-sm sticky top-0 z-50"> {/* ヘッダーを白にし、影と追従を追加 */}
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16"> {/* 高さを固定 */}
            <div className="flex items-center">
              <NavLink to="/" className="font-bold text-xl text-sky-600">
                シフト管理システム {/* ロゴやブランド名 */}
              </NavLink>
            </div>
            <div className="hidden md:block"> {/* 中サイズ以上の画面で表示 */}
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink to="/" className={navLinkClasses}>
                  ホーム
                </NavLink>
                <NavLink to="/staff" className={navLinkClasses}>
                  スタッフ管理
                </NavLink>
                <NavLink to="/shift-submission" className={navLinkClasses}>
                  シフト希望提出
                </NavLink>
                <NavLink to="/shift-dashboard" className={navLinkClasses}>
                  シフト管理
                </NavLink>
              </div>
            </div>
            {/* モバイル用メニューボタン (ハンバーガーメニュー) は後で追加可能 */}
          </div>
        </nav>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 w-full"> {/* メインコンテンツのコンテナ */}
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} シフト管理システム. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
