import {
  validateForgotInput,
  validateLoginInput,
  validateRegisterInput,
} from '../src/screens/auth/validators';

describe('auth validators', () => {
  test('login rejects empty account', () => {
    expect(validateLoginInput('', '123456')).toBe('请输入账号');
  });

  test('login rejects empty password', () => {
    expect(validateLoginInput('alice', '')).toBe('请输入密码');
  });

  test('register rejects password mismatch', () => {
    expect(
      validateRegisterInput({
        userName: 'alice',
        email: 'alice@example.com',
        code: '123456',
        password: '123456',
        confirmPassword: '123457',
      }),
    ).toBe('两次密码不一致');
  });

  test('forgot rejects empty code', () => {
    expect(
      validateForgotInput({
        login: 'alice@example.com',
        code: '',
        newPassword: '123456',
      }),
    ).toBe('请输入验证码');
  });
});
