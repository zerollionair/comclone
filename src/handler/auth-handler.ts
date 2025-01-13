import { Hono } from 'hono';
import { LoginUserRequest, RegisterUserRequest } from '../model/user-model';
import { UserService } from '../service/user-service';
import { getCookie, setCookie } from 'hono/cookie';
import { verify, sign, decode } from 'hono/jwt';
import { HTTPException } from 'hono/http-exception';

export const authHandler = new Hono<{}>();

authHandler.post('register', async (c) => {
  const register = (await c.req.json()) as RegisterUserRequest;

  const response = await UserService.register(register);

  return c.json({
    data: response,
  });
});
authHandler.post('login', async (c) => {
  const login = (await c.req.json()) as LoginUserRequest;

  const response = await UserService.login(login);

  const refreshTokenExpiry = 60 * 60 * 24 * 7;
  setCookie(c, 'user', response.refreshToken!, {
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'Strict',
    maxAge: refreshTokenExpiry,
  });

  return c.json({
    accessToken: response.tokenAccess,
  });
});
authHandler.post('refresh', async (c) => {
  const refreshToken = getCookie(c, 'user');
  if (!refreshToken) {
    throw new HTTPException(401, {
      message: 'not authorized',
    });
  }

  const refreshSecret = Bun.env.JWTREFRESHSECRET as string;
  const verifyToken = await verify(refreshToken, refreshSecret);

  if (!verifyToken) {
    throw new HTTPException(401, {
      message: 'not authorized',
    });
  }

  const { payload } = decode(refreshToken);
  console.log(payload);
  const accessSecret = Bun.env.JWTACCESSSECRET as string;

  const newAccessToken = await sign(
    {
      id: payload.id,
      role: payload.role,
      exp: Math.floor(Date.now() / 1000 + 60 * 15),
    },
    accessSecret,
    'HS256',
  );

  return c.json({
    accessToken: newAccessToken,
  });
});
