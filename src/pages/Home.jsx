import React from "react";
import FileUpload from "../components/Upload";


const HomePage = () => {

  return (
    <div className="flex flex-col items-center justify-center bg-[#dfe0e2] h-screen">
      <div className="w-[650px] min-h-[300px] bg-white p-5 rounded-3xl shadow-md shadow-black/10">
        <p className="font-semibold text-blue-800 text-center text-3xl mb-5">
          AI Document Assistant
        </p>
        <FileUpload />
      </div>
    </div>
  );
};

export default HomePage;
