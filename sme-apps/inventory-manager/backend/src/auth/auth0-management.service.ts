import { Injectable, Logger } from '@nestjs/common';
import { ManagementClient } from 'auth0';
import { Role } from '@prisma/client';

@Injectable()
export class Auth0ManagementService {
  private readonly logger = new Logger(Auth0ManagementService.name);
  private readonly client: ManagementClient;

  constructor() {
    this.client = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN!,
      clientId: process.env.AUTH0_MGMT_CLIENT_ID!,
      clientSecret: process.env.AUTH0_MGMT_CLIENT_SECRET!,
    });
  }

  async syncRole(auth0Id: string, role: Role): Promise<void> {
    try {
      await this.client.users.update(auth0Id, { app_metadata: { role } });
    } catch (err) {
      this.logger.error(`Failed to sync role for ${auth0Id}: ${(err as Error).message}`);
    }
  }
}
