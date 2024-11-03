import PostPreview from '@/components/ui/post-preview';
import { MetaballScene } from '@/components/three/scene'
import { getAllPosts } from '@/lib/api';


export default function Home() {
  const allNotes = getAllPosts();
  return (
    <div className="flex flex-col mx-2 md:px-8 gap-y-8">
      <div className='flex' style={{ height: '40vh' }}>
        <MetaballScene />
      </div>
      <div className='flex flex-col gap-y-2'>
        <h2 className="font-black text-2xl md:text-3xl">Some Readings</h2>
        {
          allNotes.map(
            (note) => <PostPreview 
                        key={note.key}
                        link={note.link}
                        title={note.title}
                        date={note.date}
                        excerpt={note.excerpt}
                        author={note.author}/>)
        }
      </div>
    </div>
  );
}
