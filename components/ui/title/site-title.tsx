import Link from "next/link";
import styles from './site-title.module.css'

export default function SiteTitle() {
    return (
        <Link href="/" className={`flex justify-center ${styles.container}`}>
            <h1 className={`text-4xl md:text-6xl font-black ${styles.text} 
                transition-all duration-200
                text-stroke before:transition-all 
                ease-in-out hover:drop-shadow-xl`}>
                TI
            </h1>
        </Link>
    )
}