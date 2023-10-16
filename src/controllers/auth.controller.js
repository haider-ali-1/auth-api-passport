import { StatusCodes } from 'http-status-codes';
import { User } from '../models/user.model.js';
import {
  asyncHandler,
  attachTokenToCookies,
  createHmac,
  generateAccessAndRefreshTokens,
} from '../utils/helpers.js';
import createError from 'http-errors';
import { sendEmail } from '../services/email.service.js';

// handle OAuth login
export const handleOAuthLogin = asyncHandler(async (req, res, next) => {
  console.log(req.user);

  const user = await User.findById(req.user?._id);
  const { accessToken, refreshToken } = generateAccessAndRefreshTokens(user);
  attachTokenToCookies(res, 'jwt', refreshToken, 24 * 60 * 60 * 1000);
  res
    .status(StatusCodes.OK)
    .redirect(`http://localhost:5000/dashboard?${refreshToken}`);
  // .json({ status: 'success', message: 'login successfully', accessToken });
});

// @ Register User
// @ POST /api/v1/auth/register

export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // set role admin for first user register
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
  const message = `please use this link for email verification\n${verificationURL}\nlink will expire after 15 minutes`;

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
      'an error has been occured during sending verification email'
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
  // generate hashed token for comapre token in db
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

// @ Login User
// @ POST /api/v1/auth/login

export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  const passwordMatch = await user?.compareWithHash(password, 'password');

  if (!user || !passwordMatch)
    throw new createError.NotFound('incorrect email or password');

  const { accessToken, refreshToken } = generateAccessAndRefreshTokens(user);

  user.refreshToken = refreshToken;
  await user.save();
  attachTokenToCookies(res, 'jwt', refreshToken, 24 * 60 * 60 * 1000); // 24 hours

  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'login successfully', accessToken });
});

// @ Logout User
// @ POST /api/v1/auth/login

export const logoutUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    { $unset: { refreshToken: '' } },
    { new: true }
  );
  res
    .status(StatusCodes.OK)
    .clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })
    .json({ status: 'success', message: 'logged out successfully' });
});
