import React from 'react';
import { Spin } from 'antd';

const SpinnerOverlay = ({ text }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div className="text-center text-white">
      <Spin size="large" />
      <p className="mt-2">{text}</p>
    </div>
  </div>
);

export default SpinnerOverlay;
