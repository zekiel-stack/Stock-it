import { useNavigate } from "react-router-dom";
import { HiOutlineShieldCheck } from "react-icons/hi2";
import { useEffect, useState } from "react";

const Authentication = () => {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div
        className={`w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl transform transition-all duration-500 ease-out ${
          animate ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
      >
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-green-100 rounded-full text-green-600 mb-4">
            <HiOutlineShieldCheck className="w-6 h-6" />
          </div>

          <h1 className="text-xl font-semibold text-gray-800 text-center">
            Congratulations!
          </h1>

          <p className="text-sm text-gray-500 mt-1 text-center">
            Your account has been successfully verified.
          </p>
        </div>

        <button
          onClick={() => navigate("/signin")}
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md"
        >
          Go to Sign In
        </button>
      </div>
    </div>
  );
};

export default Authentication;
