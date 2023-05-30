export type ImageProps = {
  id: string
  filename: string
  data: string
}

export class InMemoryDatabase {
  constructor(private images: ImageProps[]){}

  save(image: ImageProps) {
    this.images.push(image)
  }

  getById(id: string) {
    return this.images.find(image => image.id === id)
  }

  getAll() {
    return this.images
  }
}