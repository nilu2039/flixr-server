import "dotenv/config";
import express from "express";
import logger from "./lib/logger";

const main = async () => {
  const app = express();

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, () => {
    logger.info(`Server started on PORT :${PORT}`);
  });
};

main();
