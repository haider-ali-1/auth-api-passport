import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { User } from '../models/user.model.js';
import {
  asyncHandler,
  attachTokenToCookies,
  clearCookie,
  generateCryptoToken,
  generateAccessAndRefreshTokens,
} from '../utils/helpers.js';
import createError from 'http-errors';
import { sendEmail } from '../services/email.service.js';

// handle OAuth login
export const handleOAuthLogin = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user?._id);
  const { accessToken, refreshToken } = generateAccessAndRefreshTokens(user);

  user.refreshTokens = [...user.refreshTokens, refreshToken];
  await user.save();

  attachTokenToCookies(res, 'jwt', refreshToken, 24 * 60 * 60 * 1000);
  res
    .status(StatusCodes.OK)
    .redirect(`http://localhost:5000/dashboard?${accessToken}`);
});

// @ Register User
// @ POST /api/v1/auth/register

export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // set role admin for first user register
  const role = (await User.countDocuments()) === 0 ? ['admin'] : ['user'];

  const { token, hashedToken } = generateCryptoToken();

  const user = await User.create({
    name,
    email,
    password,
    role,
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpireAt: Date.now() + 15 * 60 * 1000, // 15 minutes
  });

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
      'an error has been occured during sending verification email'
    );
  }

  console.log(token, hashedToken);

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: 'an email has been sent to your email address',
  });
});

// @ Resend Email Verification
// /api/v1/auth/resend-email-verification

export const resendEmail = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  const user = await User.findById(userId);
  if (!user) throw new createError.NotFound('user not found');

  if (user.isVerified)
    throw new createError.BadRequest('email already verified');

  const { token, hashedToken } = generateCryptoToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationTokenExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save();

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
      'an error has been occured during sending verification email'
    );
  }

  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'an email has been send to your email address',
  });
});

// @ verify email verification token
// @ GET /api/v1/auth/verify-email/:token

export const verifyEmail = asyncHandler(async (req, res, next) => {
  const token = req.params.token;

  const { hashedToken } = generateCryptoToken(token);

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpireAt: { $gte: Date.now() },
  });

  if (!user)
    throw new createError.NotFound(
      'token is invalid or expire please request a new one'
    );

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpireAt = undefined;
  await user.save();

  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'your email is verified now' });
});

// @ Login User
// @ POST /api/v1/auth/login

export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email and password are correct
  const user = await User.findOne({ email });
  const passwordMatch = await user?.compareWithHash(password, 'password');
  if (!user || !passwordMatch)
    throw new createError.NotFound('incorrect email or password');

  const { accessToken, refreshToken } = generateAccessAndRefreshTokens(user);

  user.refreshTokens = [...(user.refreshTokens || []), refreshToken];
  await user.save();
  attachTokenToCookies(res, 'jwt', refreshToken, 24 * 60 * 60 * 1000); // 24 hours

  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'login successfully', accessToken });
});

// @ Logout User
// @ POST /api/v1/auth/login

export const logoutUser = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.jwt;

  // check if refresh token exist
  if (!token) throw new createError.Unauthorized('unauthorized request');

  // remove refresh token from db
  const user = await User.findById(req.user?._id);

  if (!user) throw new createError.NotFound('invalid user');

  user.refreshTokens = user.refreshTokens.filter((rt) => rt !== token);
  await user.save();

  // remove refresh token from cookies
  clearCookie(res, 'jwt');
  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'logged out successfully' });
});

// @ Refresh Access Token
// @ POST /api/v1/auth/refresh-token

export const refreshAccessToken = asyncHandler(async (req, res, next) => {
  // check if refresh token found
  const token = req.cookies?.jwt || req.body.refreshToken;
  if (!token) throw new createError.Unauthorized('unauthorized request');

  // check if refresh token is invalid (if RT expire it will return error)
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET_KEY);

  // check if user exist (use select)
  const user = await User.findById(decoded?._id);
  if (!user) throw new createError.Unauthorized('invalid user id');

  // check if refresh token reuse
  if (!user.refreshTokens.includes(token)) {
    // detected refresh token reuse logout from all
    user.refreshTokens = [];
    await user.save();

    throw new createError.Unauthorized('access denied token reuse detected');
  }

  const { accessToken, refreshToken } = generateAccessAndRefreshTokens(user);

  // replace previous token with new
  user.refreshTokens = user.refreshTokens.map((rt) =>
    rt === token ? refreshToken : rt
  );

  await user.save();

  attachTokenToCookies(res, 'jwt', refreshToken, 24 * 60 * 60 * 1000);
  res.status(StatusCodes.OK).json({ status: 'success', accessToken });
});

// @ Forgot Password
// @ POST /api/v1/auth/forgot-password

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) throw new createError.NotFound("user doesn't exists");

  // send email for password reset
  try {
    const { token, hashedToken } = generateCryptoToken();

    // prettier-ignore
    const passwordResetURL = `${req.protocol}://${req.get('host')}${req.baseUrl}/reset-password/${token}`
    const message = `please click on this link for reset password\n${passwordResetURL}\nlink will expire after 15 minutes`;

    const mailOptions = {
      from: '"Fred Foo 👻" <foo@example.com>',
      to: user.email,
      subject: 'password reset',
      text: message,
    };

    user.passwordResetToken = hashedToken;
    user.passwordResetTokenExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();
    await sendEmail(mailOptions);
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'email sent for password reset',
    });
  } catch (error) {
    throw new createError.InternalServerError(
      'failed to send email for reset password'
    );
  }
});

// @ Reset Password
// @ PATCH /api/v1/users/auth/reset-password/:token

export const resetPassword = asyncHandler(async (req, res, next) => {
  const token = req.params.token;
  const { password } = req.body;

  const { hashedToken } = generateCryptoToken(token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpireAt: { $gte: Date.now() },
  });

  // check token validity
  if (!user)
    throw new createError.Unauthorized(
      'token is invalid or expire please request a new one'
    );

  user.passwordResetToken = undefined;
  user.passwordResetTokenExpireAt = undefined;
  user.password = password;
  await user.save();
  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'password reset successfully!' });
});
