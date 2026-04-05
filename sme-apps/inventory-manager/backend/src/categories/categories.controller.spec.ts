import { Test } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('CategoriesController', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: mockService }],
    }).compile();
    controller = module.get(CategoriesController);
  });

  it('findAll delegates to service', async () => {
    mockService.findAll.mockResolvedValue([]);
    await controller.findAll();
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('create delegates to service', async () => {
    const dto = { name: 'Electronics' };
    mockService.create.mockResolvedValue({ id: 'cat1', ...dto });
    const result = await controller.create(dto);
    expect(mockService.create).toHaveBeenCalledWith(dto);
    expect(result).toMatchObject(dto);
  });

  it('update delegates to service', async () => {
    const dto = { name: 'Updated' };
    mockService.update.mockResolvedValue({ id: 'cat1', ...dto });
    const result = await controller.update('cat1', dto);
    expect(mockService.update).toHaveBeenCalledWith('cat1', dto);
    expect(result).toMatchObject(dto);
  });

  it('remove delegates to service', async () => {
    mockService.remove.mockResolvedValue({ id: 'cat1', name: 'Electronics' });
    const result = await controller.remove('cat1');
    expect(mockService.remove).toHaveBeenCalledWith('cat1');
    expect(result).toMatchObject({ id: 'cat1' });
  });
});
