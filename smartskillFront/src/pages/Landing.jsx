import Header from "../components/Header";
import Footer from "../components/Footer";
import '../index.css'; // Adjust the path if needed
import "tailwindcss/tailwind.css"; // Ensure Tailwind CSS is imported
 // Import custom styles for Landing page

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen">
  

      {/* Hero Section */}
      <section
        className="relative bg-gray-100 flex flex-col items-center justify-center text-center px-6 py-20 min-h-[500px]"
        style={{
            backgroundImage:
            'linear-gradient(rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.75) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCkt9u0iNUEg8lMLUJ8LAemufNiuRIEM_pjc2OmWR6YJWu8UP45zsdmQ5crlEUOHMkDxnAgwle4GHcR7SV0UEtzfydr2yXF_SmzCSsetT-ZJRtZRBFZf5V9XcOBPVK7ddYfiVn40sc0ZBs6zvgr3PrC-vKxQwX0xEto1Xb7akJ7s2V-RpkR6cuzyActGi0X5XG0JJglcsJ_CIlHaDXWvQR0T2nzZCmh2j2JsEtHk_fXoqL0TGX3CLxbmvOpSHQpMrSAsHK7yQaJkgQ")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}
        >
        <h1 className="text-4xl text-white font-bold mb-4">
          Discover Your Ideal Career Path
        </h1>
        <p className="max-w-6xl font-bold text-white mb-6">
          Unlock your potential with our personalized aptitude test and tailored course
          recommendations. Find the perfect fit for your skills and interests.
        </p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">
          Start Aptitude Test
        </button>
      </section>

      {/* Why Choose EduPath */}
      <section className="px-6 py-16 bg-white text-center">
        <h2 className="text-2xl font-bold mb-4">Why Choose SmartSkill?</h2>
        <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
          Our system uses advanced machine learning to provide accurate and personalized recommendations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="p-6 border rounded-xl shadow-sm bg-gray-50">
            <h3 className="font-semibold text-lg mb-2">Personalized Recommendations</h3>
            <p className="text-gray-600 text-sm">
              Receive tailored course suggestions based on your aptitude test results.
            </p>
          </div>

          <div className="p-6 border rounded-xl shadow-sm bg-gray-50">
            <h3 className="font-semibold text-lg mb-2">Accurate Skill Assessment</h3>
            <p className="text-gray-600 text-sm">
              Identify your strengths and areas for improvement with detailed skill assessments.
            </p>
          </div>

          <div className="p-6 border rounded-xl shadow-sm bg-gray-50">
            <h3 className="font-semibold text-lg mb-2">Comprehensive Course Catalog</h3>
            <p className="text-gray-600 text-sm">
              Explore a wide range of courses from top educational institutions.
            </p>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="px-6 py-20 bg-gray-50 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Begin Your Journey?</h2>
        <p className="text-gray-600 mb-6">
          Take the first step towards a brighter future with EduPath.
        </p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">
          Get Started Now
        </button>
      </section>

 
    </div>
  );
}
