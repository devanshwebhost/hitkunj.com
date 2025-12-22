
import { Bell } from "lucide-react";
import Link from "next/link";
export default function Notify() {
    return(
<Link
  href="/notifications"
  className="absolute right-1 z-10 top-[70px] text-gray-600 hover:text-amber-600 transition"
>
  <Bell size={24} />
</Link>

    )
}