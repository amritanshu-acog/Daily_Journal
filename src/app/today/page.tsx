import { redirect } from 'next/navigation';

export default function TodayPage() {
  const today = new Date().toISOString().slice(0, 10);
  redirect(`/entries/${today}`);
}
