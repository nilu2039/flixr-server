import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import STATUS_CODES from "../lib/http-status-codes";

export const validatePostBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedBody = schema.parse(req.body);
      req.body = validatedBody;
      next();
    } catch (error) {
      res.sendError("Invalid body", STATUS_CODES.BAD_REQUEST, error.errors);
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.query = validatedQuery;
      next();
    } catch (error) {
      res.sendError("Invalid query", STATUS_CODES.BAD_REQUEST, error.errors);
    }
  };
};
