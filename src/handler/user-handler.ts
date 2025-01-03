import { Hono } from 'hono';
import { UserService } from '../service/user-service';
import { deleteCookie } from 'hono/cookie';

export const userHandler = new Hono();

userHandler.get('users/current', async (c) => {
  const payload = c.get('jwtPayload');

  const response = await UserService.current(payload.id);
  return c.json({
    data: response,
  });
});
userHandler.patch('current', async (c) => {
  const payload = c.get('jwtPayload');
  const request = await c.req.json();

  const response = await UserService.update(payload.id, request);

  return c.json({
    data: response.message,
  });
});

userHandler.patch('users/current/reset-password', async (c) => {
  const payload = c.get('jwtPayload');
  const request = await c.req.json();

  const response = await UserService.resetPassword(payload.id, request);

  return c.json({
    data: response.message,
  });
});

userHandler.delete('users/current', async (c) => {
  deleteCookie(c, 'user');
  return c.json({
    data: 'logout success',
  });
});
