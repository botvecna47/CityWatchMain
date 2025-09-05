import React from 'react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to CityWatch
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your community safety platform for reporting and managing city issues
          </p>
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              What is CityWatch?
            </h2>
            <p className="text-gray-600 mb-4">
              CityWatch is a community-driven platform that allows citizens to report 
              city issues and enables authorities to manage and respond to these reports 
              efficiently.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">For Citizens</h3>
                <p className="text-blue-600 text-sm">
                  Report issues, track progress, and stay informed about your community
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">For Authorities</h3>
                <p className="text-green-600 text-sm">
                  Manage reports, update status, and communicate with citizens
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
