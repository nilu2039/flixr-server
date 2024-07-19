import { z } from "zod";
import { Request, Response, NextFunction } from "express";

const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.query = validatedQuery;
      next();
    } catch (error) {
      res.sendError("Invalid query", 400, error.errors);
    }
  };
};

export default validateQuery;
