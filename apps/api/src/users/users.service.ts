import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { wallets: true, identityProfile: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll(params: { page: number; pageSize: number; status?: string }) {
    const { page, pageSize, status } = params;
    const where = status ? { status: status as never } : {};
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: { wallets: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, total, page, pageSize };
  }
}
