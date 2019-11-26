
import { createParamDecorator } from '@nestjs/common';

export const User = createParamDecorator((data, req) => {
  return req.res.locals.authorizedUser ? req.res.locals.authorizedUser : null;
});