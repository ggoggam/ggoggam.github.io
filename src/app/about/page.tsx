import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { getImages } from "@/lib/images";
import Image from "next/image";


export default async function AboutPage() {
  const imageFileNames = getImages()

  return (
    <div className="max-w-2xl mx-auto flex flex-col space-y-4 py-4 md:py-8">
      <div className="max-w-2xl mx-auto flex flex-col space-y-4 py-4 md:py-8">
        <h1 className="font-black text-4xl">ABOUT</h1>
        <p className="leading-relaxed">
          I am currently working as a research engineer at a medical artificial intelligence company (Lunit, if you are curious).
          Prior to this, I was a software engineer at an early stage startup, where I gained invaluable experience in building technology from ground up.
          While my main focus is on MLOps, my interests are broad, spanning user interfaces and experiences, backend, and computer science in general.
        </p>
        <p className='leading-relaxed'>
          Through this blog, I intend to share my insights and learnings from my past-time tinkerings, readings, and work. 
          Occassionally, I dabble on topics in artificial intelligence. 
          My recent research has centered on applying Bayesian methodologies to deep learning models, with a particular focus on language models.
          I am based in Seoul, South Korea, where I live with my black cat, <i>Ggoggam</i> (꼬깜).
        </p>
      </div>
      <div className="flex flex-col items-center justify-center">
        <Carousel className="w-full max-w-sm md:max-w-md">
        <CarouselContent>
          {imageFileNames.map((src, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <Image src={src} alt="image of ggoggam" width={512} height={512}></Image>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden lg:block">
          <CarouselPrevious />
          <CarouselNext />
        </div>
        </Carousel>
      </div>
    </div>
    
  )
}
