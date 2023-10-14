import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/user.model.js';

const handleOAuthUser = async (profile, done) => {
  const { provider, id } = profile;
  const { name, picture, email, email_verified } = profile._json;

  const foundUser = await User.findOne({ email, provider });

  if (!foundUser) {
    const newUser = await User.create({
      name,
      email,
      provider,
      [`${provider}Id`]: id,
      profileImage: picture,
      provider,
      isVerified: email_verified,
    });
    done(null, newUser);
  } else {
    done(null, foundUser);
  }
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (_, __, profile, done) => {
      handleOAuthUser(profile, done);
    }
  )
);

export { passport };
