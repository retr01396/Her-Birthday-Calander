"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ClubFilterSelect({
  clubs,
  categoryFilter,
  defaultValue,
}: {
  clubs: { id: string; name: string }[];
  categoryFilter?: string;
  defaultValue: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clubId = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    
    if (clubId) {
      params.set("clubId", clubId);
    } else {
      params.delete("clubId");
    }

    if (categoryFilter) {
      params.set("category", categoryFilter);
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <select
      name="clubId"
      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
      onChange={handleChange}
      defaultValue={defaultValue}
    >
      <option value="">All Clubs</option>
      {clubs.map((club) => (
        <option key={club.id} value={club.id}>
          {club.name}
        </option>
      ))}
    </select>
  );
}
