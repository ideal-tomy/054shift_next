import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { Button } from "@/components/ui/button";
import StaffManagementPage from './pages/StaffManagementPage';
import ShiftSubmissionPage from './pages/ShiftSubmissionPage'; // ShiftSubmissionPageをインポート

// ホームページのコンテンツをコンポーネントとして切り出す (変更なし)
function HomePage() {
  const [count, setCount] = useState(0);

  return (
    // (省略) HomePageのJSXは変更なし
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 className="text-3xl font-bold text-blue-600 underline">Vite + React</h1>
      <div className="my-4 flex flex-wrap gap-2">
        <Button>Default Button</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link Button</Button>
      </div>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}


function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <nav className="p-4 bg-gray-100">
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="text-blue-500 hover:text-blue-700">ホーム</Link>
            </li>
            <li>
              <Link to="/staff" className="text-blue-500 hover:text-blue-700">スタッフ管理</Link>
            </li>
            <li>
              <Link to="/submit-shift" className="text-blue-500 hover:text-blue-700">シフト提出</Link> {/* 追加 */}
            </li>
          </ul>
        </nav>

        <main className="p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/staff" element={<StaffManagementPage />} />
            <Route path="/submit-shift" element={<ShiftSubmissionPage />} /> {/* 追加 */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

