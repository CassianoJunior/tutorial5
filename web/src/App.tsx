const App = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <FileInput />
    </div>
  )
}

const FileInput = () => {

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (file) {
      console.log(file)
      console.log('size', file.size / 1024, 'KB')
    }
  }

  return (
    <div className="max-w-[50%] m-auto items-center justify-center flex flex-col">
      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="file_input">Upload file</label>
      <input className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" 
        id="file_input" 
        type="file"
        about="Upload file"
        onChange={(e) => handleChangeFile(e)}
      />
    </div>
  )
}

export { App }

