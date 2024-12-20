import { Hono } from 'hono';
import { LoginUserRequest, RegisterUserRequest } from '../model/user-model';
import { UserService } from '../service/user-service';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { jwt } from 'hono/jwt';

export const userHandler = new Hono<{}>();

userHandler.post('register', async (c) => {
  const register = (await c.req.json()) as RegisterUserRequest;

  const response = await UserService.register(register);

  return c.json({
    data: response,
  });
});
userHandler.post('/login', async (c) => {
  const login = (await c.req.json()) as LoginUserRequest;

  const response = await UserService.login(login);

  setCookie(c, 'user', response.token!, {
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'Strict',
    maxAge: Math.floor(300),
  });
  return c.json({
    data: response,
  });
});
userHandler.get('/users/current', async (c) => {
  const payload = c.get('jwtPayload');

  const response = await UserService.current(payload.id);
  return c.json({
    data: response,
  });
});
userHandler.patch('/users/current', async (c) => {
  const payload = c.get('jwtPayload');
  const request = await c.req.json();

  await UserService.update(payload.id, request);

  return c.json({
    data: 'update success',
  });
});
userHandler.delete('/users/current', async (c) => {
  deleteCookie(c, 'user');
  return c.json({
    data: 'logout success',
  });
});
