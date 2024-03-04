import { GoSearch } from "react-icons/go";

export default function Search({search,onChange}) {
  return (
    <div className="flex items-center rounded-md bg-white border border-black72 mt-6 px-4 py-2">
      <GoSearch className="text-black56  text-lg block float-left cursor-pointer mr-2" />

      <input
        type={"search"}
        placeholder={search}
        className="text-base bg-transparent w-full
              text-black focus:outline-none "
        onChange={onChange}
      />
    </div>
  );
}
