import cors from '@fastify/cors';
import Fastify from "fastify";
import { generate } from 'shortid';
import z from 'zod';
import { InMemoryDatabase } from './database/inMemory';

async function bootstrap() {
  const fastify = Fastify({
    logger: true,
    bodyLimit: 1048576 * 20, // 20MB
  });
  
  fastify.register(cors, {
    origin: '*',
  })

  const database = new InMemoryDatabase([]);

  fastify.post("/upload", async (request, reply) => {
    
    const bodySchema = z.object({
      filename: z.string().nonempty(),
      data: z.string().nonempty(),
    })

    const body = bodySchema.parse(request.body);

    const { filename, data } = body;

    const image = {
      id: generate(),
      filename,
      data,
    }

    database.save(image);

    return reply.status(201).send({ id: image.id });
  })

  // fastify.get("/image/:id", async (request, reply) => {

  //   const id = request.params.id;

  //   if (!id) {
  //     return reply.status(400).send({ error: 'Id is required' });
  //   }

  //   const image = database.getById(id);



  //   if (!image) {
  //     return reply.status(404).send({ error: 'Image not found' });
  //   }

  //   return reply.status(200).send({ filename: image.filename, data: image.data });
  // })

  fastify.get("/images", async (request, reply) => {
    const images = database.getAll();

    return reply.status(200).send(images);
  })

  // fastify.get("/", async (request, reply) => {
  //   return { hello: "world" };
  // })

  await fastify.listen({ port: 3333 });
}

bootstrap();