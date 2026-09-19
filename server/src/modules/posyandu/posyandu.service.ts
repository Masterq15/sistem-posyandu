import prisma from '../../shared/config/prisma';

export const posyanduService = {
  async findAll() {
    return prisma.posyandu.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { balitas: true, lansias: true, kaders: true },
        },
      },
    });
  },

  async findById(id: string) {
    return prisma.posyandu.findUnique({
      where: { id },
      include: {
        _count: {
          select: { balitas: true, lansias: true },
        },
      },
    });
  },

  async create(data: { nama: string; desa: string; kecamatan: string; alamat: string }) {
    const existing = await prisma.posyandu.findFirst({
      where: {
        nama: {
          equals: data.nama.trim(),
          mode: 'insensitive',
        },
      },
    });
    if (existing) {
      const err = new Error('Nama Posyandu sudah digunakan. Silakan gunakan nama lain');
      (err as any).statusCode = 409;
      throw err;
    }
    return prisma.posyandu.create({
      data: {
        ...data,
        nama: data.nama.trim(),
      },
    });
  },

  async update(id: string, data: Partial<{ nama: string; desa: string; kecamatan: string; alamat: string }>) {
    if (data.nama && data.nama.trim()) {
      const existing = await prisma.posyandu.findFirst({
        where: {
          id: { not: id },
          nama: {
            equals: data.nama.trim(),
            mode: 'insensitive',
          },
        },
      });
      if (existing) {
        const err = new Error('Nama Posyandu sudah digunakan. Silakan gunakan nama lain');
        (err as any).statusCode = 409;
        throw err;
      }
    }
    return prisma.posyandu.update({
      where: { id },
      data: {
        ...data,
        ...(data.nama && { nama: data.nama.trim() }),
      },
    });
  },

  async delete(id: string) {
    const count = await prisma.posyandu.findUnique({
      where: { id },
      include: { _count: { select: { balitas: true, lansias: true } } },
    });
    if (count && (count._count.balitas > 0 || count._count.lansias > 0)) {
      const err = new Error('Posyandu tidak dapat dihapus karena masih memiliki data Balita/Lansia');
      (err as any).statusCode = 409;
      throw err;
    }
    return prisma.posyandu.delete({ where: { id } });
  },
};
