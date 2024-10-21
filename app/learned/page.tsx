import PostPreview from "@/components/post-preview";
import { getAllNotes } from "@/lib/api";

export default function LearnedPage() {
  const allNotes = getAllNotes();

  return <div className="flex flex-col py-4 space-y-4 px-8">
    {/* <h3 className="text-4xl font-bold">/learned</h3> */}
    <h4>Snippets of code or personal notes on what I learned today</h4>
    <div>
      {allNotes.map((note) => PostPreview({ post: note }))}
    </div>
  </div>
}