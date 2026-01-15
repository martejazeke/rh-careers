"use client";
import { supabase } from "@/app/lib/supabase-client";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure? This will permanently delete this blog post.")) return;

    const { error } = await supabase.from("blogs").delete().eq("id", id);
    
    if (error) {
      alert("Error deleting: " + error.message);
    } else {
      router.refresh(); // Refresh the server component to update the list
    }
  };

  return (
    <button 
      onClick={handleDelete}
      className="text-slate-400 hover:text-red-600 transition-colors font-medium"
    >
      Delete
    </button>
  );
}