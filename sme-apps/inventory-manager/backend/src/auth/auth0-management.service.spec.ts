import { Test } from '@nestjs/testing';
import { Auth0ManagementService } from './auth0-management.service';
import { Role } from '@prisma/client';

const mockUsersUpdate = jest.fn();

jest.mock('auth0', () => ({
  ManagementClient: jest.fn().mockImplementation(() => ({
    users: { update: mockUsersUpdate },
  })),
}));

describe('Auth0ManagementService', () => {
  let service: Auth0ManagementService;

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.AUTH0_DOMAIN = 'test.auth0.com';
    process.env.AUTH0_MGMT_CLIENT_ID = 'client-id';
    process.env.AUTH0_MGMT_CLIENT_SECRET = 'client-secret';

    const module = await Test.createTestingModule({
      providers: [Auth0ManagementService],
    }).compile();
    service = module.get(Auth0ManagementService);
  });

  it('syncRole calls management.users.update with correct args', async () => {
    mockUsersUpdate.mockResolvedValue({});
    await service.syncRole('auth0|abc123', Role.MANAGER);
    expect(mockUsersUpdate).toHaveBeenCalledWith(
      'auth0|abc123',
      { app_metadata: { role: 'MANAGER' } },
    );
  });

  it('syncRole does not throw when management API fails', async () => {
    mockUsersUpdate.mockRejectedValue(new Error('Auth0 unavailable'));
    await expect(service.syncRole('auth0|abc123', Role.ADMIN)).resolves.not.toThrow();
  });
});
