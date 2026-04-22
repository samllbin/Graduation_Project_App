import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {createHttpClient} from '../src/api/http';
import {clearToken, getToken, setToken} from '../src/store/authStore';

describe('http client', () => {
  afterEach(() => {
    clearToken();
  });

  test('injects bearer token', async () => {
    setToken('abc-token');
    const client = createHttpClient();
    const mock = new MockAdapter(client);

    mock.onGet('/test-token').reply(config => {
      expect(config.headers?.Authorization).toBe('Bearer abc-token');
      return [200, {code: 200, message: 'ok', data: {ok: true}}];
    });

    const response = await client.get('/test-token');
    expect(response.data.ok).toBe(true);
  });

  test('normalizes biz error', async () => {
    const client = createHttpClient();
    const mock = new MockAdapter(client);

    mock.onGet('/biz-error').reply(200, {code: 400, message: '业务失败'});

    await expect(client.get('/biz-error')).rejects.toMatchObject({
      message: '业务失败',
      code: 400,
    });
  });

  test('handles 401 by clearing token', async () => {
    setToken('abc-token');
    const client = createHttpClient();
    const mock = new MockAdapter(client);

    mock.onGet('/unauthorized').reply(401, {message: 'Unauthorized'});

    await expect(client.get('/unauthorized')).rejects.toMatchObject({
      status: 401,
    });

    expect(getToken()).toBe('');
  });
});
