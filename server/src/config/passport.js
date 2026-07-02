// config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('./database');
const bcrypt = require('bcrypt');

// // console.log('Loading Passport Google Strategy...');
// // console.log('Callback URL:', `${process.env.API_URL || 'http://localhost:5000'}/api/auth/google/callback`);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL || 'http://localhost:5000'}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        console.log(`Google login attempt for: ${email}`);

        const placeholderHash = await bcrypt.hash(Math.random().toString(36), 10);
        const user = await prisma.user.upsert({
          where: { email },
          update: {
            googleId: profile.id,   
            isVerified: true,      
          },
          create: {
            email,
            firstName: profile.name.givenName || 'Google',
            lastName: profile.name.familyName || 'User',
            googleId: profile.id,                  
            passwordHash: placeholderHash,        
            isVerified: true,
            role: 'VOTER',
          },
        });

        console.log(`Google user processed: ${user.email}`);
        return done(null, user);
      } catch (err) {
        console.error('❌ Google Strategy Error:', err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
      },
    });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;