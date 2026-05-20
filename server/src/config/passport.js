const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('./index');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateTokens } = require('../utils/jwt');

passport.use(new GoogleStrategy({
  clientID: config.google.clientId,
  clientSecret: config.google.clientSecret,
  callbackURL: config.google.callbackUrl,
  passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    let user = await prisma.user.findUnique({
      where: { googleId: profile.id },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          avatarUrl: profile.photos[0]?.value,
          role: 'VOTER',
        },
      });
    }

    const tokens = generateTokens(user.id);
    done(null, { user, tokens });
  } catch (error) {
    done(error, null);
  }
}));

passport.serializeUser((data, done) => done(null, data));
passport.deserializeUser((data, done) => done(null, data));

module.exports = passport;