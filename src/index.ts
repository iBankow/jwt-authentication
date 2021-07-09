import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from "./entity/User";
import * as express from "express";
import { Request, Response } from "express";
import { RegisterDTO } from "./dto/request/register.dto";
import { Database } from "./database";
import { PasswordHash } from "./security/passwordHash";
import { AuthenticationDTO } from "./dto/response/authentication.dto";
import { UserDTO } from "./dto/response/user.dto";
import { JWT } from "./security/jwt";

const app = express();

app.use(express.json());

Database.initialize();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello There!");
});

app.post("/register", async (req: Request, res: Response) => {
  try {
    const body: RegisterDTO = req.body;

    if (body.password !== body.repeatPassword)
      throw new Error("Repeat password does not match the password!");

    if (await Database.userRepository.findOne({ email: body.email }))
      throw new Error("Email has already been registered!");

    const user = new User();
    user.username = body.username;
    user.email = body.email;
    user.password = await PasswordHash.hashPassword(body.password);

    await Database.userRepository.save(user);

    const authenticationDTO: AuthenticationDTO = new AuthenticationDTO();
    const userDTO: UserDTO = new UserDTO();

    userDTO.id = user.id;
    userDTO.username = user.username;
    userDTO.email = user.email;

    const tokenAndRefreshToken = await JWT.generateToken(user);
    authenticationDTO.user = userDTO;
    authenticationDTO.token = tokenAndRefreshToken.token;
    authenticationDTO.refreshToken = tokenAndRefreshToken.refreshToken;

    res.json(authenticationDTO);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
app.listen(4000, () => {
  console.log("Listening on PORT: 4000");
});

createConnection()
  .then(async (connection) => {})
  .catch((error) => console.log(error));
