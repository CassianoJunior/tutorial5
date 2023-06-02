'use client'

import Image from "next/image";
import { useRef, useState } from "react";

const App = () => {
  return (
    <div className="h-screen m-auto max-w-5xl flex flex-row items-center justify-center">
      <FileInput />
      <ImageList />
    </div>
  )
}

const FileInput = () => {
  const inputFileRef = useRef<HTMLInputElement>(null)

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (file) {
      console.log(file)
      console.log('size', file.size / 1024, 'KB')
    }
  }

  const handleClickSendButton = async () => {
    
    const file = inputFileRef.current?.files?.[0]
    
    if (!file) return;

    let reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = async (e) => {
      const formData = { data: e.target?.result, filename: file.name }

      return await fetch('http://localhost:3333/upload', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(res => res.json())
      .then(res => console.log(res))
      .catch(err => console.log(err))

    }
  }

  return (
    <div className="max-w-[50%] m-auto items-center justify-center flex flex-col gap-4">
      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="file_input">Upload file</label>
      <input className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" 
        id="file_input" 
        type="file"
        about="Upload file"
        onChange={(e) => handleChangeFile(e)}
        ref={inputFileRef}
      />
      <button
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        onClick={handleClickSendButton}
      >Enviar</button>
    </div>
  )
}

interface ImageProps {
  id: string;
  data: string;
  filename: string;
}

const ImageList = () => {
  const [images, setImages] = useState<ImageProps[]>([])


  const handleClickUpdateButton = () => {
    fetch('http://localhost:3333/images')
      .then(res => res.json())
      .then(res => setImages(res))
      .catch(err => console.log(err))
  }


  return (
      <div className="max-w-[50%] m-auto flex flex-col gap-16 items-center justify-center">
        <div className=" items-center justify-center flex flex-col gap-4">
          {images.length > 0 ? images.map((image: ImageProps) => (
            <Image key={image.id} src={image.data} alt={image.filename}  width={20} height={20} className="w-10 h-10" />
          )) : (
            <p className="text-gray-400">Nenhuma imagem encontrada</p>
          )}
        </div>
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={handleClickUpdateButton}
          >Atualizar</button>
    </div>
  )

}

export default  App 

