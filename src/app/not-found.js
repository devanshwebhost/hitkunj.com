import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-divine-gradient text-center p-4">
      <h2 className="text-6xl font-bold text-spiritual-amber mb-4">404</h2>
      <p className="text-xl text-gray-800 mb-6">क्षमा करें, यह पृष्ठ उपलब्ध नहीं है।</p>
      <Link href="/" className="px-6 py-3 bg-spiritual-dark text-white rounded-full hover:bg-amber-700 transition">
        होम पेज पर जाएं
      </Link>
    </div>
  )
}