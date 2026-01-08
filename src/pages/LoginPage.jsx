export default function LoginPage({ onLogin }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Stealth App
        </h1>
        <p className="text-center text-gray-600 mb-8">Login to continue</p>
        <button
          onClick={onLogin}
          className="w-full py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          Login Now
        </button>
      </div>
    </div>
  );
}
