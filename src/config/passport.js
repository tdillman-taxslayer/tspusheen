const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

const keys = require("../config/config");
import Application from "../models/Application";
let opts = {};
opts.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.JWT_SECRET_KEY;

// the passed in value
module.exports = passport => {
  passport.use(
    new JWTStrategy(opts, async (payload, done) => {
      const { id } = payload;
      // get the user object
      let user = await Application.findById(id);
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    })
  );
};
