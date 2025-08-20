import { Link } from "react-router-dom";
import '../index.css'; // Adjust the path if needed
import "tailwindcss/tailwind.css"; // Ensure Tailwind CSS is imported
import "./Header.css";

export default function Header() {
  return (
    <header className="flex items-center justify-between border-b border-[#e7edf4] px-10 py-3 bg-white shadow-sm">
      <div className="flex items-center gap-2 text-[#0d141c]">
        <div className="size-5">
          <svg viewBox="0 0 48 48" fill="currentColor">
            <path d="M4 4H17.3V17.3H30.7V30.7H44V44H4V4Z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold">SmartSkill</h2>
      </div> 

      <div className="flex items-center gap-6">
        <nav className="flex gap-8">
          <Link className="text-sm font-medium" to="/">Home</Link>
          <Link className="text-sm font-medium" to="/about">About</Link>
          <Link className="text-sm font-medium" to="/courses">Courses</Link>
          <Link className="text-sm font-medium" to="/contact">Contact</Link>
        </nav>

     <Link to="/get-started" className="cssbuttons-io-button">
      Get started
      <div className="icon bg-blue-600">
        <svg
          height="24"
          width="24"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
            fill="#3700ff"
          />
        </svg>
      </div>
    </Link>

      </div>
    </header>
  );
}
