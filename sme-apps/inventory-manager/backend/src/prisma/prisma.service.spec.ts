import { Test } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();
    service = module.get(PrismaService);
    // Prevent actual DB connection in tests
    jest.spyOn(service, '$connect').mockResolvedValue();
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });
});
