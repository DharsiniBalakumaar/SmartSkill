import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
// import About from "./pages/About";
// import Courses from "./pages/Courses";
// import Contact from "./pages/Contact";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
          
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
