// components/ThemeToggle.js
import { useTheme } from 'next-themes';
import SunIcon from '@/assets/images/sun.svg';
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
      <div className='h-8 w-8'
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <span><SunIcon/></span>
    </div>
  );
}
