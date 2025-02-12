import { useNavigate } from "react-router-dom";
import Header from "./Header.jsx";

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <Header />
      <h1 className="text-4xl font-bold mb-6 text-gray-800">This is the Homepage</h1>
      <button 
        onClick={() => navigate("/")} 
        className="p-2 bg-red-500 text-white rounded">
        Logout
      </button>
    </div>
  );
}
