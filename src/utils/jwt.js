import jwt from 'jsonwebtoken';

export const generateAccessAndRefreshTokens = (user) => {
  const { _id, name, role } = user;
  const accessTokenPayload = { _id, name, role };
  const refreshTokenPayload = { _id };

  // prettier-ignore
  const {JWT_ACCESS_TOKEN_SECRET_KEY, JWT_REFRESH_TOKEN_SECRET_KEY} = process.env

  const accessToken = jwt.sign(
    accessTokenPayload,
    JWT_ACCESS_TOKEN_SECRET_KEY,
    {
      expiresIn: '15m',
    }
  );
  const refreshToken = jwt.sign(
    refreshTokenPayload,
    JWT_REFRESH_TOKEN_SECRET_KEY,
    {
      expiresIn: '24h',
    }
  );
  return { accessToken, refreshToken };
};
