import { Request, Response, NextFunction } from "express";
import { createResponse } from "../utils/responseHandler";

declare global {
  namespace Express {
    interface Response {
      sendSuccess<T>(data: T, statusCode?: number): void;
      sendError(message: string, statusCode?: number, details?: any): void;
    }
  }
}

export const responseMiddleware = (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  res.sendSuccess = <T>(data: T, statusCode = 200) => {
    res.status(statusCode).json(createResponse(true, data));
  };
  res.sendError = (message: string, statusCode = 400, details?: any) => {
    res
      .status(statusCode)
      .json(createResponse(false, undefined, { message, details }));
  };
  next();
};
