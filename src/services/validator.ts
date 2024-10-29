
import {HttpErrors} from '@loopback/rest';
import isemail from 'isemail';
import {KeyAndPassword} from '../models';
import {Credentials} from '../repositories';

export function validateCredentials(credentials: Credentials) {
  // Validate Email
  if (!isemail.validate(credentials.email)) {
    throw new HttpErrors.UnprocessableEntity('invalid email');
  }

  // Validate Password Length
  if (!credentials.password || credentials.password.length < 8) {
    throw new HttpErrors.UnprocessableEntity(
      'password must be minimum 8 characters',
    );
  }
}

export function validateKeyPassword(keyAndPassword: KeyAndPassword) {
  // Validate Password Length
  if (!keyAndPassword.password || keyAndPassword.password.length < 8) {
    throw new HttpErrors.UnprocessableEntity(
      'password must be minimum 8 characters',
    );
  }

  if (keyAndPassword.password !== keyAndPassword.confirmPassword) {
    throw new HttpErrors.UnprocessableEntity(
      'password and confirmation password do not match',
    );
  }

  if (
    keyAndPassword.resetKey.length === 0 ||
    keyAndPassword.resetKey.trim() === ''
  ) {
    throw new HttpErrors.UnprocessableEntity('reset key is mandatory');
  }
}
