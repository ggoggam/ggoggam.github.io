import Image from "next/image";

type AvatarProps = {
    name: string;
    image: string;
}

export default function Avatar({ name, image }: AvatarProps) {
    return (
        <div className="flex items-center gap-x-2">
            <Image src={image} width={48} height={48} className="rounded-full" alt={name}/>
            <div className="text-xl font-semibold">{name}</div>
        </div>
    )
}