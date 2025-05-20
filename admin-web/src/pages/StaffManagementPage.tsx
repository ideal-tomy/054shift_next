import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// 初期スタッフデータ
const initialStaffList = [
  { id: 'S001', name: '山田 太郎', email: 'yamada.taro@example.com', role: '店長' },
  { id: 'S002', name: '佐藤 花子', email: 'sato.hanako@example.com', role: 'アルバイトリーダー' },
  { id: 'S003', name: '鈴木 一郎', email: 'suzuki.ichiro@example.com', role: '正社員' },
  { id: 'S004', name: '田中 次郎', email: 'tanaka.jiro@example.com', role: 'アルバイト' },
];

// スタッフの型定義
interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
}

const StaffManagementPage: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>(initialStaffList);
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);

  // 新規スタッフ追加フォームの入力値の状態
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('');

  const handleAddStaff = () => {
    if (!newStaffName.trim()) {
      alert('スタッフ名を入力してください。'); // 簡単なバリデーション
      return;
    }
    const newStaff: Staff = {
      id: `S${String(staffList.length + 1).padStart(3, '0')}`, // 簡単なID生成
      name: newStaffName,
      email: newStaffEmail,
      role: newStaffRole,
    };
    setStaffList([...staffList, newStaff]);
    // フォームをリセット
    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffRole('');
    setIsAddStaffDialogOpen(false); // ダイアログを閉じる
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">スタッフ管理</h1>
        <Button onClick={() => setIsAddStaffDialogOpen(true)}>新規スタッフ追加</Button>
      </div>

      <Table>
        <TableCaption>登録されているスタッフの一覧です。</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>スタッフ名</TableHead>
            <TableHead>メールアドレス</TableHead>
            <TableHead>役職</TableHead>
            <TableHead className="text-right">アクション</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffList.length > 0 ? (
            staffList.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell className="font-medium">{staff.id}</TableCell>
                <TableCell>{staff.name}</TableCell>
                <TableCell>{staff.email}</TableCell>
                <TableCell>{staff.role}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="mr-2">
                    編集
                  </Button>
                  <Button variant="destructive" size="sm">
                    削除
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                登録されているスタッフはいません。
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={isAddStaffDialogOpen} onOpenChange={setIsAddStaffDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>新規スタッフ追加</DialogTitle>
            <DialogDescription>
              新しいスタッフの情報を入力してください。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                名前
              </Label>
              <Input
                id="name"
                placeholder="山田 太郎"
                className="col-span-3"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                メールアドレス
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="staff@example.com"
                className="col-span-3"
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                役職
              </Label>
              <Input
                id="role"
                placeholder="アルバイト"
                className="col-span-3"
                value={newStaffRole}
                onChange={(e) => setNewStaffRole(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              setIsAddStaffDialogOpen(false);
              // フォームリセットもここで行うと良い
              setNewStaffName('');
              setNewStaffEmail('');
              setNewStaffRole('');
            }}>キャンセル</Button>
            <Button type="button" onClick={handleAddStaff}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffManagementPage;
