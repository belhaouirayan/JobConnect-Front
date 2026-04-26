import React from "react";
import { Link } from "react-router-dom";
import { Newspaper } from "lucide-react";

const DashboardEmp = () => {

  return (
    <div className="min-h-screen px-6 py-8">
      <h1 className="text-2xl font-bold mb-4 dark:text-gray-200">Dashboard Employee/Manager</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-8 max-w-2xl">
        Welcome to the dashboard! Here you can find an overview of your activities and performance.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Actualité RH removed from here */}
      </div>
    </div>
  );
}

export default DashboardEmp;
