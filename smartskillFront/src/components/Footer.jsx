import '../index.css'; // Adjust the path if needed
import "tailwindcss/tailwind.css"; // Ensure Tailwind CSS is imported
export default function Footer() {
  return (
    <footer className="flex justify-center bg-gray-50 mt-10">
      <div className="flex flex-col gap-4 px-5 py-6 text-center">
        <div className="flex gap-6 justify-center">
          <a className="text-[#49739c]" href="#">Privacy Policy</a>
          <a className="text-[#49739c]" href="#">Terms of Service</a>
          <a className="text-[#49739c]" href="/contact">Contact Us</a>
        </div>
        <p className="text-[#49739c] text-sm">
          ©2025 SmartSkill. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
