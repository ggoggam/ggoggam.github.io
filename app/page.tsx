import PostPreview from '@/components/post-preview';
import { MetaballScene } from '@/components/three/scene'
import { getAllNotes } from '@/lib/api';


export default function Home() {
  const allNotes = getAllNotes();
  return (
    <div className="flex flex-col mx-2 md:px-8 gap-y-8">
      <div className='flex' style={{ height: '40vh' }}>
        <MetaballScene />
      </div>
      <div className='flex flex-col gap-y-2'>
        <h2 className="font-black text-2xl md:text-3xl">Some Readings</h2>
        {
          allNotes.map((note) => <PostPreview post={note}/>)
        }
      </div>
    </div>
  );
}
