// src/components/common/Loader.jsx
export default function Loader() {
  return (
    <div className="flex justify-center py-10">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-600"></div>
    </div>
  );
}