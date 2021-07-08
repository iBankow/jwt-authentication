import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from "./entity/User";
import * as express from "express";

const app = express();

app.listen(4000, () => {
  console.log("Listening on port: 4000");
});

createConnection()
  .then(async (connection) => {})
  .catch((error) => console.log(error));
