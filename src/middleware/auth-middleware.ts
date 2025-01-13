import { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';

export const authorizedRole = (allowedRoles: string[]): MiddlewareHandler => {
  return async (c, next) => {
    const user = c.get('jwtPayload');
    if (!user || !allowedRoles.includes(user.role)) {
      throw new HTTPException(401, {
        message: 'You do not have access',
      });
    }
    await next();
  };
};
