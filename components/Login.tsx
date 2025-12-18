import React from "react";
import { FcGoogle } from "react-icons/fc";

const LoginCard = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
        >
          ✕
        </button>

        <h2 className="text-sm font-semibold text-gray-700">Sign In</h2>

        {/* Sign In with Google */}
        <button className="flex items-center justify-center w-full px-4 py-2 mt-4 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 focus:outline-none">
          <FcGoogle className="w-5 h-5 mr-2" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LoginCard;
