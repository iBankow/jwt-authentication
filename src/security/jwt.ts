import * as jwt from "jsonwebtoken";
import { User } from "../entity/User";
import { v4 as uuidv4 } from "uuid";
import { RefreshToken } from "../entity/RefreshToken";
import * as moment from "moment";
import { Database } from "../database";

export class JWT {
  private static JWT_SECRETE = "123456";

  public static async generateToken(user: User) {
    const payload = {
      id: user.id,
      email: user.email,
    };
    const jwtId = uuidv4();
    const token = jwt.sign(payload, this.JWT_SECRETE, {
      expiresIn: "1h",
      jwtid: jwtId,
      subject: payload.id.toString(),
    });

    const refreshToken = await this.generateRefreshTokenForUserAndToken(
      user,
      jwtId
    );

    return { token, refreshToken };
  }

  private static async generateRefreshTokenForUserAndToken(
    user: User,
    jwtId: string
  ) {
    // create a new record of refresh token
    const refreshToken = new RefreshToken();
    refreshToken.user = user;
    refreshToken.jwtId = jwtId;
    // set the expiry date of the refresh token for exemple 10 days
    refreshToken.expiryDate = moment().add(10, "d").toDate();

    //store this refresh token
    await Database.refreshTokenRepository.save(refreshToken);

    return refreshToken.id;
  }
}
