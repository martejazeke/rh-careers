"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/app/lib/supabase-client";
import "react-quill-new/dist/quill.snow.css";

// Load Quill dynamically to prevent Next.js SSR errors
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-100 animate-pulse rounded-md" />,
});

export default function CreateBlogForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return alert("Please fill in all fields");
    setLoading(true);

    try {
      let imageUrl = "";

      // 1. Upload Image to Storage
      if (file) {
        const fileExt = file.name.split(".").pop();
        // Use a clean filename to avoid bucket issues
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("blog-thumbnails")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("blog-thumbnails")
          .getPublicUrl(uploadData.path);

        imageUrl = urlData.publicUrl;
      }

      // 2. Generate SEO-Friendly & Unique Slug
      const baseSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // Remove special chars
        .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with -
        .replace(/^-+|-+$/g, ""); // Trim dashes from start/end
      
      const generatedSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

      // 3. Clean Excerpt for the Feed
      const plainTextExcerpt = content
        .replace(/<[^>]*>?/gm, "") 
        .replace(/&nbsp;/g, " ") 
        .substring(0, 160)
        .trim() + "...";

      // 4. Insert into Database
      const { error: dbError } = await supabase.from("blogs").insert([
        {
          title,
          content,
          slug: generatedSlug,
          featured_image: imageUrl,
          excerpt: plainTextExcerpt,
          is_published: true,
        },
      ]);

      if (dbError) throw dbError;

      alert("🎉 Blog Post Published Successfully!");
      window.location.href = "/resources/blogs";
    } catch (error: any) {
      console.error("Error details:", error);
      alert(`Error: ${error.message || "Something went wrong"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 bg-white min-h-[80vh] shadow-2xl rounded-2xl my-12 border border-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800">
            Create Blog Post
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Publish high-quality insights for Rebus Holdings.
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#4a647e] hover:bg-[#364a5c] text-white px-10 py-3 rounded-full font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
        >
          {loading ? "Publishing..." : "Publish Article"}
        </button>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-3 gap-10 text-black" onSubmit={(e) => e.preventDefault()}>
        {/* Left Column: Title and Editor */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              Article Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-serif border-b-2 border-slate-100 focus:border-[#4a647e] outline-none py-3 transition-colors text-slate-900 placeholder:text-slate-200"
              placeholder="The Future of MEP Construction..."
              required
            />
          </div>

          <div className="min-h-[450px]">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              Content Body
            </label>
            <div className="prose prose-slate max-w-none">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                className="h-[350px] mb-12 bg-white rounded-xl overflow-hidden border-slate-200"
                placeholder="Write your story here..."
              />
            </div>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="space-y-8">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 sticky top-8">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Featured Image
            </label>
            
            <div className="relative group cursor-pointer border-2 border-dashed border-slate-300 rounded-xl overflow-hidden aspect-video flex items-center justify-center bg-white hover:border-[#4a647e] transition-all">
              {preview ? (
                <>
                  <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <p className="text-white text-xs font-bold">Change Image</p>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <p className="text-slate-400 text-xs font-medium">
                    Upload a high-res cover image
                  </p>
                </div>
              )}
              <input
                type="file"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
              />
            </div>
            
            <div className="mt-8 space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-tighter">
                <span className="text-slate-400">Status</span>
                <span className="text-green-500">Public</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-tighter">
                <span className="text-slate-400">Visibility</span>
                <span className="text-slate-900">Immediate</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}