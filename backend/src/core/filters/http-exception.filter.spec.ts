import { ArgumentsHost, BadRequestException, HttpException, Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ originalUrl: '/api/test' }),
      getResponse: () => ({ status }),
    }),
  } as unknown as ArgumentsHost;
  let log: jest.SpyInstance;

  beforeEach(() => { log = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined); });
  afterEach(() => { jest.restoreAllMocks(); });

  it.each(['development', 'test', 'production'])('hides unknown errors in %s', (mode) => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = mode;
    try {
      const error = new Error('database password details');
      new HttpExceptionFilter().catch(error, host);
      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({
        statusCode: 500, error: 'Internal Server Error', message: 'Internal server error',
        path: '/api/test', timestamp: expect.any(String),
      });
      expect(log).toHaveBeenCalledWith('Unhandled exception', error.stack);
    } finally {
      if (previous === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previous;
    }
  });

  it('preserves validation messages', () => {
    new HttpExceptionFilter().catch(new BadRequestException(['name must be a string']), host);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400, message: ['name must be a string'] }));
  });

  it('never copies stack or arbitrary properties from HTTP exceptions', () => {
    new HttpExceptionFilter().catch(new HttpException({ message: 'Invalid request', stack: 'secret trace', secret: 'private' }, 400), host);
    expect(json.mock.calls.at(-1)?.[0]).toEqual({
      statusCode: 400, error: 'Bad Request', message: 'Invalid request', path: '/api/test', timestamp: expect.any(String),
    });
  });
});
