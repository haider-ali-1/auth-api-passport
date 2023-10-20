import crypto from 'crypto';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import jwt from 'jsonwebtoken';

export const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};

export const __dirname = (fileURL) => {
  return dirname(fileURLToPath(fileURL));
};

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

export const attachTokenToCookies = (res, name, value, age) => {
  res.cookie(name, value, {
    maxAge: age,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
};

export const clearCookie = (res, name) => {
  res.clearCookie(name, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
};

export const verifyJwt = (token, secret) => {
  return jwt.verify(token, secret);
};

export const filterStackMessage = (stack) => {
  const [errorLine, ...linesArray] = stack
    .split('\n')
    .map((line) => line.trim());
  return [
    errorLine,
    ...linesArray.filter((line) => {
      return line.includes('file:');
    }),
  ];
};

export const generateCryptoToken = (randomToken) => {
  const token = randomToken || crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hashedToken };
};

export const sendVerificationEmail = async () => {
  try {
    // prettier-ignore
    const verificationURL = `${req.protocol}://${req.get('host')}${req.baseUrl}/verify-email/${token}`
    const message = `please click on this link for email verification\n${verificationURL}\nlink will expire after 15 minutes`;

    const mailOptions = {
      from: '"Fred Foo 👻" <foo@example.com>',
      to: user.email,
      subject: 'email verification',
      text: message,
    };

    await sendEmail(mailOptions);
  } catch (error) {
    throw new createError.InternalServerError(
      'failed to send verification email'
    );
  }
};
