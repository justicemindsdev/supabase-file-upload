export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <div className="z-10 w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
          Supabase File Upload System
        </h1>
        
        <div className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/50 p-6 shadow-lg">
          <p className="text-center text-slate-300 mb-4">
            This is a placeholder page for the Supabase File Upload System.
          </p>
          <p className="text-center text-slate-300">
            The full application is available on GitHub at: 
            <a 
              href="https://github.com/justicemindsdev/supabase-file-upload" 
              className="text-blue-400 hover:text-blue-300 ml-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              justicemindsdev/supabase-file-upload
            </a>
          </p>
        </div>
      </div>
      
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-400/10 blur-[40px]" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-purple-400/10 blur-[50px]" />
      </div>
    </main>
  )
}
