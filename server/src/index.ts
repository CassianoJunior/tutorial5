import Fastify from "fastify";

async function bootstrap() {
  const fastify = Fastify({
    logger: true,
  });

  fastify.get("/", async (request, reply) => {
    return { hello: "world" };
  })

  await fastify.listen({ port: 3333 });
}

bootstrap();