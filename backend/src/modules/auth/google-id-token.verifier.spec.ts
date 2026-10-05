import { OAuth2Client } from 'google-auth-library';
import { AppConfigService } from '../../core/config/app-config.service';
import { GoogleIdTokenVerificationError, GoogleIdTokenVerifier } from './google-id-token.verifier';

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({ verifyIdToken: jest.fn() })),
}));

describe('GoogleIdTokenVerifier', () => {
  const config = { get: jest.fn().mockReturnValue('web-client-id') } as unknown as AppConfigService;

  function mockedVerify(): jest.Mock {
    const instance = (OAuth2Client as unknown as jest.Mock).mock.results.at(-1)?.value;
    return instance.verifyIdToken as jest.Mock;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('verifies the token audience and returns trusted verified claims', async () => {
    const verifier = new GoogleIdTokenVerifier(config);
    mockedVerify().mockResolvedValue({
      getPayload: () => ({
        iss: 'https://accounts.google.com',
        sub: 'google-sub',
        email: 'user@example.com',
        email_verified: true,
        name: 'User',
        picture: 'https://example.com/avatar.png',
      }),
    });

    await expect(verifier.verify('id-token')).resolves.toEqual({
      sub: 'google-sub',
      email: 'user@example.com',
      name: 'User',
      picture: 'https://example.com/avatar.png',
    });
    expect(mockedVerify()).toHaveBeenCalledWith({ idToken: 'id-token', audience: 'web-client-id' });
  });

  it('rejects untrusted issuers and unverified email addresses', async () => {
    const verifier = new GoogleIdTokenVerifier(config);
    mockedVerify().mockResolvedValue({ getPayload: () => ({ iss: 'evil', sub: 's', email: 'u@example.com', email_verified: true }) });
    await expect(verifier.verify('id-token')).rejects.toMatchObject({ code: 'invalid_issuer' });

    mockedVerify().mockResolvedValue({ getPayload: () => ({ iss: 'accounts.google.com', sub: 's', email: 'u@example.com', email_verified: false }) });
    await expect(verifier.verify('id-token')).rejects.toMatchObject({ code: 'email_not_verified' });
  });

  it('uses a typed error when audience is missing', async () => {
    const verifier = new GoogleIdTokenVerifier({ get: jest.fn().mockReturnValue('') } as unknown as AppConfigService);
    await expect(verifier.verify('id-token')).rejects.toBeInstanceOf(GoogleIdTokenVerificationError);
    await expect(verifier.verify('id-token')).rejects.toMatchObject({ code: 'missing_audience' });
  });
});
