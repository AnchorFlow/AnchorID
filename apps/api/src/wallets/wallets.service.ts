import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import type { LinkWalletDto } from './dto/link-wallet.dto';

@Injectable()
export class WalletsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  findMine(userId: string) {
    return this.prisma.wallet.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  }

  async link(
    userId: string,
    dto: LinkWalletDto,
    context: { ipAddress?: string; userAgent?: string },
  ) {
    const existing = await this.prisma.wallet.findUnique({
      where: { stellarAddress: dto.stellarAddress },
    });
    if (existing) {
      throw new ConflictException('This Stellar address is already linked to an account');
    }

    await this.authService.verifyAddressOwnership(dto.stellarAddress, dto.transactionXdr, context);

    return this.prisma.wallet.create({
      data: {
        userId,
        stellarAddress: dto.stellarAddress,
        isPrimary: false,
        verifiedAt: new Date(),
      },
    });
  }

  async setPrimary(userId: string, walletId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: walletId, userId, deletedAt: null },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');

    await this.prisma.$transaction([
      this.prisma.wallet.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false },
      }),
      this.prisma.wallet.update({
        where: { id: walletId },
        data: { isPrimary: true },
      }),
    ]);

    return this.prisma.wallet.findUnique({ where: { id: walletId } });
  }

  async remove(userId: string, walletId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: walletId, userId, deletedAt: null },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');
    if (wallet.isPrimary) {
      throw new ForbiddenException('Cannot remove your primary wallet — set another wallet as primary first');
    }

    const remaining = await this.prisma.wallet.count({ where: { userId, deletedAt: null } });
    if (remaining <= 1) {
      throw new BadRequestException('You must keep at least one linked wallet');
    }

    await this.prisma.wallet.update({
      where: { id: walletId },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }
}
