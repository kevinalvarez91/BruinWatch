import { Link } from "react-router-dom";

//We can do / instead of Home.jsx and it will return to the original homepage
const Header = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex space-x-4">
        <li>  
          <Link to="/home" className="text-white hover:text-gray-400">Home</Link>
        </li>
        <li>
          <Link to="/about" className="text-white hover:text-gray-400">About</Link>
        </li>
        <li>
          <Link to="/contact" className="text-white hover:text-gray-400">Contact</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Header;
