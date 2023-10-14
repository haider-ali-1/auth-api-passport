import { StatusCodes } from 'http-status-codes';
import { User } from '../models/user.model.js';
import {
  asyncHandler,
  attachTokenToCookies,
  createHmac,
  generateAccessAndRefreshTokens,
  randomString,
} from '../utils/helpers.js';
import createError from 'http-errors';
import { sendEmail } from '../services/email.service.js';

// handle OAuth login
export const handleOAuthLogin = asyncHandler(async (req, res, next) => {
  const { accessToken, refreshToken } = generateAccessAndRefreshTokens(
    req.user
  );

  attachTokenToCookies(res, accessToken, refreshToken);
  res.redirect(`/dashboard`);
});

// @ show current user profile
// @ GET /api/v1/auth/register

export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  const role = (await User.countDocuments()) === 0 ? ['admin'] : ['user'];

  const { token, hashedToken } = createHmac(
    null,
    process.env.EMAIL_VERIFICATION_TOKEN_SECRET
  );

  const user = await User.create({
    name,
    email,
    password,
    role,
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpireAt: Date.now() + 15 * 60 * 1000, // 15 minutes
  });

  // prettier-ignore
  const verificationURL = `${req.protocol}://${req.get('host')}${req.baseUrl}/verify-email/${token}`
  const message = `please use this link for email verification\n${verificationURL}`;

  const mailOptions = {
    from: '"Fred Foo 👻" <foo@example.com>',
    to: user.email,
    subject: 'email verification link',
    text: message,
  };

  try {
    await sendEmail(mailOptions);
  } catch (error) {
    throw new createError.InternalServerError(
      'an error has been occured during sending email for email'
    );
  }

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    message:
      'an email has been sent to your email address please verify before login',
  });
});

// @ verify email verification token
// @ GET /api/v1/auth/verify-email/:token

export const verifyEmail = asyncHandler(async (req, res, next) => {
  const emailVerificationToken = req.params.token;
  const { hashedToken } = createHmac(
    emailVerificationToken,
    process.env.EMAIL_VERIFICATION_TOKEN_SECRET
  );

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpireAt: { $gte: Date.now() },
  });
  if (!user)
    throw new createError.NotFound('invalid or expire verification token');

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpireAt = undefined;
  await user.save();

  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'your email is verified now' });
});

// @ show current user profile
// @ GET /api/v1/auth/login

export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  const passwordMatch = await user?.compareWithHash(password, 'password');

  if (!user || !passwordMatch)
    throw new createError.NotFound('incorrect email or password');

  const { accessToken, refreshToken } = generateAccessAndRefreshTokens(user);

  user.refreshToken = refreshToken;
  await user.save();
  attachTokenToCookies(res, 'jwt', refreshToken, 24 * 60 * 60 * 1000);

  res
    .status(StatusCodes.OK)
    .json({ status: 'success', data: { user, accessToken } });
});

export const logout = asyncHandler(async (req, res, next) => {});
