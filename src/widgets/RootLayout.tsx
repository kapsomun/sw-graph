import { Link, Outlet } from 'react-router-dom';


export function RootLayout() {
  return (
    <div className="min-h-screen relative  text-yellow-300 overflow-hidden">
       <div className='starfield-background'></div>
      <div
        className="relative z-10 grid grid-rows-[auto_1fr] min-h-screen"
        style={{ isolation: 'isolate', transform: 'translateZ(0)' }}
      >
        <header className="border-b border-yellow-600/40 h-15 p-3 flex items-center gap-4">
          <Link to="/" className="font-semibold text-yellow-400 hover:text-yellow-200 transition">
            SW Graph
          </Link>
        </header>
        <main className="p-3 max-w-6xl mx-auto bg-black w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
