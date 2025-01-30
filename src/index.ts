import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import { userHandler } from './handler/user-handler';
import { authHandler } from './handler/auth-handler';
import { jwt } from 'hono/jwt';
import { productHandler } from './handler/product-handler';
import { chartHandler } from './handler/chart-handler';
import { prismaClient } from './application/database';

const app = new Hono();

app.use('*', cors());

app.use(
  '/api/*',
  jwt({
    secret: Bun.env.JWTACCESSSECRET as string,
    cookie: {
      key: Bun.env.COOKIEKEY as string,
    },
  }),
);

app.use('/api/*', async (c, next) => {
  const user = c.get('jwtPayload');
  const userCheck = await prismaClient.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      blacklist: true,
    },
  });
  if (userCheck!.blacklist === true) {
    return c.json({
      message: 'account is blacklisted',
    });
  }
  await next();
});

app.route('/', authHandler);

const apiHandler = new Hono();

apiHandler.route('/users', userHandler);
apiHandler.route('/products', productHandler);
apiHandler.route('/charts', chartHandler);

app.route('/api', apiHandler);

app.onError(async (err, c) => {
  if (err instanceof HTTPException) {
    c.status(err.status);
    return c.json({
      errors: err.message,
    });
  } else if (err instanceof ZodError) {
    c.status(400);
    return c.json({
      errors: err.message,
    });
  } else {
    c.status(500);
    return c.json({
      errors: err.message,
    });
  }
});

app.notFound((c) => c.json({ message: 'Route Not Found' }, 400));

export default {
  port: 5000,
  fetch: app.fetch,
};
