const config = require('config');

const jwt = require('../utils/jsonwebtoken');
const UserModel = require('../models/user');
const sendEmail = require('../libs/email');

const jwtSecret = config.get('mailer.secret');
const omit =
  'emailVerified salt password_hash verifyEmailToken resetPasswordToken __v';

module.exports = {
  getCurrentUser() {
    return async ctx => {
      const { user } = ctx.state;
      ctx.body = { user };
    };
  },

  createUser() {
    return async ctx => {
      const { email, password, displayName = '' } = ctx.request.body;
      const payload = {
        sub: email,
      };
      const options = {
        algorithm: 'HS512',
        expiresIn: '1h',
      };

      const jwtToken = await jwt.signToken(payload, jwtSecret, options);

      const user = await UserModel.create({
        displayName,
        email,
        password,
        verifyEmailToken: jwtToken,
      });

      await sendEmail({
        to: email,
        subject: 'Registration',
        template: 'registration.email',
        link: `http://${config.get('server.host')}:3000/verify/${jwtToken}`,
      });

      ctx.body = {
        user: user.toObject({ omit }),
      };
    };
  },

  deleteUser() {
    return async ctx => {
      const { user } = ctx.state;
      ctx.logout();

      await user.remove();
      ctx.body = { deleted: user.id };
    };
  },

  logout() {
    return async ctx => {
      ctx.logout();

      ctx.body = {
        type: 'status',
        message: 'Log out succeeded.',
      };
    };
  },

  updateEmail() {
    return async ctx => {
      const { user } = ctx.state;

      const {
        data: { email, password },
      } = ctx.request.body;

      if (!user.validatePassword(password)) {
        ctx.throw(400, 'Invalid password specified.');
      } else {
        user.email = email;
        await user.save();

        ctx.body = {
          type: 'status',
          message: 'Email successfully updated.',
        };
      }
    };
  },

  updatePassword() {
    return async ctx => {
      const { user } = ctx.state;
      const {
        data: { oldPassword, newPassword },
      } = ctx.request.body;

      if (!user.validatePassword(oldPassword)) {
        ctx.throw(400, 'Invalid password specified.');
      }

      user.password = newPassword;
      await user.save();

      ctx.body = {
        type: 'status',
        message: 'Password successfully updated.',
      };
    };
  },

  verifyEmail() {
    return async ctx => {
      const { token } = ctx.params;
      const options = {
        algorithm: 'HS512',
        ignoreExpiration: true,
      };
      const { exp, sub } = await jwt.verifyToken(token, jwtSecret, options);
      const timestamp = Date.now() / 1000;
      const user = await UserModel.findOne({
        email: sub,
        verifyEmailToken: token,
      }).exec();

      if (!user) {
        ctx.throw(400, 'Invalid token specified or account does not exist.');
      }

      if (timestamp > exp && !user.emailVerified) {
        await UserModel.deleteOne({ email: sub }).exec();
        ctx.throw(401, 'Token already expired.');
      }

      if (user.emailVerified) {
        ctx.throw(400, 'Account already verified.');
      }

      user.emailVerified = true;
      await user.save();

      ctx.body = {
        type: 'status',
        message: 'Account successfully verified',
      };
    };
  },

  forgotPassword() {
    return async ctx => {
      const { email } = ctx.request.body;

      const user = await UserModel.findOne({ email }).exec();

      if (!user) {
        ctx.throw(400, 'Account does not exist.');
      }

      const secret = user.password_hash + user.created;
      const token = await jwt.signToken({ sub: email }, secret, {
        expiresIn: '30m',
      });

      user.resetPasswordToken = token;
      await user.save();

      await sendEmail({
        to: email,
        subject: 'Simplenote Password Reset',
        template: 'reset.email',
        link: `http://${config.get(
          'server.host',
        )}:3000/password/${token}/reset`,
      });

      ctx.body = {
        type: 'status',
        message: 'Email with instructions has been sent.',
      };
    };
  },

  resetPassword() {
    return async ctx => {
      const { token, password } = ctx.request.body;
      const user = await UserModel.findOne({
        resetPasswordToken: token,
      }).exec();

      if (!user) {
        ctx.throw(400, 'Invalid reset password token specified.');
      }

      const secret = user.password_hash + user.created;
      await jwt.verifyToken(token, secret);

      user.password = password;
      user.resetPasswordToken = '';
      await user.save();

      ctx.body = {
        type: 'status',
        messages: 'Password successfully reset.',
      };
    };
  },
};
