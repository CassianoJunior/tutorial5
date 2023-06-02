# Tutorial 5

> Tutorial de como fazer upload de arquivos para a aplicação web (servidor). Por exemplo: pode-se criar um formulário de upload de imagem e um formulário para listar os arquivos salvos na aplicação web.

## Setup inicial

Para iniciar, o projeto foi dividido em 2 partes: Front-end (usando [Next](https://nextjs.org/docs) e [React](https://react.dev)) e Back-end (usando [Node](https://nodejs.org/en) e [Fastify](https://www.fastify.io)).
O projeto front-end está localizado na pasta web, enquanto o projeto back-end, na pasta server.

### Front-end

Para iniciar e criar um novo projeto ```Next``` do zero, basta entrar no terminal e digitar o seguinte comando.

```bash
npx create-next-app@latest web --use-npm
```

  Em que:

- web é o nome da pasta onde o projeto será criado.
- --use-npm especifica o gerenciador de pacotes que iremos utilizar

Após isso, responda sim (Yes), para todas as perguntas que serão feitas.

Agora, entre na pasta do projeto digite `npm run dev` no terminal e abra o navegador na url `http://localhost:3000` e aparecerá uma página pronta do **Next**.

### Back-end

Para a criação do nosso servidor, crie uma pasta server na raiz do projeto. Assim, ficaremos com a seguinte estrutura:

```bash
$PROJECT_ROOT
  ├── server
  └── web
```

Feito isso, entre na pasta server e inicie um novo projeto Node. Para isso, dentro da pasta do projeto, basta abrir o terminal e digitar o comando:

```bash
npm init -y
```

Em que a flag ```-y``` indica sim como resposta para todas as perguntas realizadas. isso é feito para agilizar o processo.
Agora basta instalar as dependências que vamos precisar para configurar nosso servidor:

- Fastify - Framework HTTP para as requisições.
- Zod - Permite a validação de dados.
- Fastify/cors - Permite a configuração do cors no servidor
- shortid - Geração automatica de id's únicos.
- TypeScript - JavaScript com sintaxe para tipos.
- tsx - Compilador TypeScript.

Use os comando a seguir para instalar as dependências:

- Dependências de produção:
  
```bash
npm i fastify @fastify/cors shortid zod
```

- Dependências de desenvolvimento

```bash
npm i -D typescript tsx @types/shortid
```

Inicie o TypeScript:

```bash
npx tsc --init --target es2020
```

Agora, no arquivo ```package.json```:

```json
"scripts": {
  "dev": "tsx watch src/index.ts"
}
```

Esse comando permite que nossa aplicação inicie em ambiente de desenvolviemnto, no endereço ```http://localhost:3333```

Agora, basta criarmos esse arquivo index.ts, que será a porta de entrada para nosso servidor.

Crie o arquivo dentro da pasta ```src```.

Para testar se está funcionando, cole o seguinte código no arquivo ```index.ts```:

```ts
import Fastify from "fastify";

async function bootstrap() {

  // Instanciando o fastify
  const fastify = Fastify()

  // Criando uma rota de teste
  fastify.get("/", async (request, reply) => {
    return { hello: "world" };
  })

  await fastify.listen({ port: 3333 });
}

bootstrap();
```

Feito isso, digite o comando ```npm run dev``` no terminal e em seguida abra seu navegador no endereço ```http://localhost:3333```. No seu navegador, aparecerá algo como isso:

```json
hello: "world"
```

Se apareceu está tudo certo, e você pode continuar com o tutorial. Caso algo dê errado revise os passos anteriores e certifique-se que os seguiu a risca.

## Manipulando imagens na aplicação

Vamos entender agora, como transitar imagens na nossa aplicação. Existem muitas formas de fazer isso, e uma formas mais simples é transformar as imagens em *base64* e enviar para o servidor como string.
O problema dessa abordagem é a grande quantidade de dados, já que a codificação em *base64* aumenta em pelo menos 33% do tamanho original. Mas como é uma aplicação simples, usaremos como exemplo.

### Lado do cliente

Aqui, usaremos o elemento input do HMTL e definiremos ele como tipo **File** para que seja possível mover arquivos. Em seguida, definiremos uma função que será executada quando o usuário clicar no botão responsável por enviar esse arquivo. Veja abaixo:

```tsx
// src/app/page.tsx'use client'

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
      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" 
      htmlFor="file_input">Upload file</label>
      <input className="block w-full p-2 text-sm text-gray-900 border border-gray-300 
      rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 
      focus:outline-none dark:bg-gray-700 
      dark:border-gray-600 dark:placeholder-gray-400" 
        id="file_input" 
        type="file"
        about="Upload file"
        onChange={(e) => handleChangeFile(e)}
        ref={inputFileRef}
      />
      <button
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 
        focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 
        dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none 
        dark:focus:ring-blue-800"
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
            <Image 
              key={image.id} 
              src={image.data} 
              alt={image.filename}  
              width={20} 
              height={20} 
              className="w-10 h-10" 
            />
          )) : (
            <p className="text-gray-400">Nenhuma imagem encontrada</p>
          )}
        </div>
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300
          font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 
          dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={handleClickUpdateButton}
          >Atualizar</button>
    </div>
  )

}

export default App 
```

### Lado do servidor

Para preparmos o servidor, basta criarmos uma rota post em uma rota, aqui escolhemos `/upload`, mas pode ser qualquer nome. Após definirmos a rota, temos que definir o que o servidor vai fazer quando essa rota for chamada.
Outra coisa importante é configurar o cors, para habilitar requisições do nosso front-end.
Além disso, vamos definir um banco de dados em tempo de execução, apenas para efeito de demonstração de persitência de dados. Veja a seguir:

```ts
// src/index.ts
import cors from '@fastify/cors';
import Fastify from "fastify";
import { generate } from 'shortid';
import z from 'zod';
import { InMemoryDatabase } from './database/inMemory';

async function bootstrap() {
  /*
    Configurações do nosso servidor:
    logger: Definimos que queremos que ele mostre no terminal informções
    bodyLimit: Definimos o tamanho do body suportado por requisição
  */
  const fastify = Fastify({
    logger: true,
    bodyLimit: 1048576 * 20, // 20MB
  });
  
  // Habilitamos o cors para todas as origens
  fastify.register(cors, {
    origin: '*',
  })

  // Instanciação do banco de dados em memória
  const database = new InMemoryDatabase([]);

  // Definição da nossa rota de upload de imagens
  fastify.post("/upload", async (request, reply) => {
    
    // Validação do corpo da requisição
    const bodySchema = z.object({
      filename: z.string().nonempty('Filename is required'),
      data: z.string().nonempty('Image base64 data is required'),
    })

    const body = bodySchema.parse(request.body);

    const { filename, data } = body;

    // Criação da nossa entidade
    const image = {
      id: generate(),
      filename,
      data,
    }

    // Persisstimos no banco de dados
    database.save(image);

    // Retornamos informações úteis da imagem
    return reply.status(201).send({ id: image.id });
    })

  // Rota para retornar uma imagem específica pelo id
  fastify.get("/image/:id", async (request, reply) => {

    // Validação dos parâmetros
    const paramsSchema = z.object({
      id: z.string().nonempty('Id is required'),
    })

    const params = paramsSchema.parse(request.params);

    const { id } = params;

    if (!id) {
      return reply.status(400).send({ error: 'Id is required' });
    }

    const image = database.getById(id);

    if (!image) {
      return reply.status(404).send({ error: 'Image not found' });
    }

    // Retorna a imagem
    return reply.status(200).send({ filename: image.filename, data: image.data });
  })

  // Rota que retorna todas as imagens
  fastify.get("/images", async (request, reply) => {
    const images = database.getAll();

    return reply.status(200).send(images);
  })

  fastify.get("/", async (request, reply) => {
    return { hello: "world" };
  })

  await fastify.listen({ port: 3333 });
}

bootstrap();
```

Agora, para o banco de dados em memória, basta criarmos uma classe que terá uma lista como atributo, como segue:

```ts
// src/database/inMemory.ts
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

```

Aqui definimos métodos para salvar uma imagem, buscar uma imagem por id e buscar todas as imagens.
