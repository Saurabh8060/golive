import { Search } from '../icons';

export default function SearchBar() {
  return (
    <div className="flex items-center w-full max-w-[400px] md:max-w-[500px] h-8">
      <input
        type="text"
        placeholder="Search"
        className="w-full bg-white border border-slate-400 px-2 py-1 text-sm rounded-l-md focus:outline-none focus:ring-1 focus:ring-golivehub-purple"
      />
      <button className="bg-gray-200 text-black px-2 py-1 rounded-r-md hover:bg-gray-300 transition">
        <Search />
      </button>
    </div>
  );
}
