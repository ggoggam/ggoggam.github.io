import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { getImages } from "@/lib/images";
import Image from "next/image";


export default async function AboutPage() {
  const imageFileNames = getImages()

  return (
    <div className="max-w-2xl mx-auto flex flex-col space-y-4 py-4 md:py-8">
      <h1 className="font-black text-4xl">ABOUT</h1>
      <p className="leading-relaxed">
        I am currently a research engineer at a medical artificial intelligence company (Lunit, if you are curious).
        Though my current main focus is on MLOps, I have a wide range of interests spanning from user interface / experience, backend, and computer science in general.
        My intention here is to share my insights and learnings from my past-time tinkerings and work. 
      </p>
      <p className='leading-relaxed pb-12'>
        I occassionally research on topics in artificial intelligence. 
        My recent research topic was on applying Bayesian methodologies to deep learning models, language model in particular.
        I am currently based in Seoul, South Korea with my black cat, ggoggam.
      </p>
      <div className="flex flex-col items-center justify-center">
        <Carousel className="w-full max-w-md">
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
        <CarouselPrevious />
        <CarouselNext />
        </Carousel>
      </div>
    </div>
    
  )
}
