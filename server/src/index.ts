import cors from '@fastify/cors';
import Fastify from "fastify";
import { generate } from 'shortid';
import z from 'zod';
import { InMemoryDatabase } from './database/inMemory';
import { dropbox } from './lib/dropbox';

async function bootstrap() {
  const fastify = Fastify({
    logger: true,
  });
  
  fastify.register(cors, {
    origin: '*',
  })

  fastify.register(require('@fastify/multipart'), {
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB
    }
  })

  const database = new InMemoryDatabase([]);

  fastify.post("/upload", async (request, reply) => {
    const bodySchema = z.object({
      file: z.any()
    })

    const { file } = await request.file();

    console.log(file)
    
    const upload = await dropbox.filesUpload({path: `/${generate()}.png`, contents: file})

    const dbxImageId = upload.result.id;

    const share = await dropbox.sharingCreateSharedLinkWithSettings({path: dbxImageId});

    const url = share.result.url;

    const imageUrl = url.replace('dl=0', 'raw=1');

    const imageId = generate();

    database.save({filename: 'Teste', url: imageUrl, id: imageId});
    
    return reply.status(201).send({ id: imageId });
  })

  fastify.get("/image/:id", async (request, reply) => {

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

    return reply.status(200).send({...image});
  })

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