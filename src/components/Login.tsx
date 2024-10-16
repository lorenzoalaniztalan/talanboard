import React, { useState } from 'react';

interface LoginProps {
  onLogin: (nombre: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [nombre, setNombre] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim()) {
      onLogin(nombre.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
      <div className="relative p-1 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 animate-border-gradient">
        <form onSubmit={handleSubmit} className="w-96 p-8 bg-white bg-opacity-20 backdrop-blur-lg rounded-xl shadow-2xl flex flex-col items-center space-y-6">
          <h2 className="text-3xl font-bold mb-6 text-center text-white">Welcome to Talan Board</h2>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-white placeholder-white placeholder-opacity-70"
            required
          />
          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-md hover:from-blue-500 hover:to-purple-600 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;