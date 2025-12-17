import { Spin } from "antd";

export default function LoaderSpinner() {
  return (
    <div className='h-screen w-screen flex items-center justify-center bg-gray-50'>
      <div className="flex flex-col items-center gap-3">
        <Spin size="large" />
        <span className="text-gray-500 text-sm">Loading...</span>
      </div>
    </div>
  );
}
