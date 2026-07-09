import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";

const asyncHandler = <
  P = Record<string, string>,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
>(
  requestHandler: (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
  ) => Promise<any>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
};

export default asyncHandler;