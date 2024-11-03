import PostPreview from "@/components/ui/post-preview";
import { getAllPosts } from "@/lib/api";

export default function LearnedPage() {
  const allNotes = getAllPosts();

  return <div className="flex flex-col py-4 space-y-4 px-8">
    {/* <h3 className="text-4xl font-bold">/learned</h3> */}
    <h4>Snippets of code or personal notes on what I learned today</h4>
    <div>
    </div>
  </div>
}