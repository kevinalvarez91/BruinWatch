import { useState } from 'react'
import './App.css'
import { motion } from "framer-motion";

//this is kevin branch

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <motion.h1 
        className="text-4xl font-bold mb-6 text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        CS35L project
      </motion.h1>

      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-6 text-center">
        <p className="text-gray-600 mb-4">
          This is the base webpage for the CS35L project.
        </p>
        <motion.div 
          whileHover={{ scale: 1.1 }} 
          whileTap={{ scale: 0.9 }}
        >
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            Click Me
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default App
