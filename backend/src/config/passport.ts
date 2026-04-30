import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { AppDataSource } from './database';
import { User } from '../entities/User';

passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        const user = await AppDataSource.getRepository(User).findOne({
          where: { email: email.toLowerCase().trim() },
        });

        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

export default passport;
