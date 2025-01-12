import path from 'path'
import fs from 'fs'

const imageDirectory = path.join(process.cwd(), 'public', 'ggoggam')

export function getImages() {
    // get images from the public folder
    const fileNames = fs.readdirSync(imageDirectory)
    // return the images
    return fileNames.map((name) => path.join('/ggoggam', name))
}