import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Casa Inteligente",
    slug: "casa-inteligente",
    description: "Automacao residencial elegante, pratica e pronta para o dia a dia.",
    imageUrl:
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Audio Premium",
    slug: "audio-premium",
    description: "Fones, caixas de som e acessorios para ouvir com mais imersao.",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Workspace",
    slug: "workspace",
    description: "Equipamentos para montar uma mesa moderna, produtiva e confortavel.",
    imageUrl:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Bem-estar",
    slug: "bem-estar",
    description: "Produtos pensados para descanso, foco e uma rotina mais leve.",
    imageUrl:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
  },
];

const products = [
  {
    name: "Lampada Aurora Wi-Fi",
    slug: "lampada-aurora-wifi",
    description:
      "Lampada inteligente com controle por app, timer programavel e cenas de iluminacao para diferentes momentos do dia.",
    priceInCents: 17990,
    stock: 32,
    featured: true,
    imageUrl:
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80",
    categorySlug: "casa-inteligente",
  },
  {
    name: "Hub Pulse Mini",
    slug: "hub-pulse-mini",
    description:
      "Central compacta para conectar dispositivos da casa, criar rotinas e acompanhar automacoes em tempo real.",
    priceInCents: 24990,
    stock: 18,
    featured: true,
    imageUrl:
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=900&q=80",
    categorySlug: "casa-inteligente",
  },
  {
    name: "Headphone Orbit Pro",
    slug: "headphone-orbit-pro",
    description:
      "Headphone sem fio com cancelamento de ruido, bateria longa e encaixe confortavel para trabalho ou viagem.",
    priceInCents: 89990,
    stock: 14,
    featured: true,
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    categorySlug: "audio-premium",
  },
  {
    name: "Soundbar Linen One",
    slug: "soundbar-linen-one",
    description:
      "Soundbar com acabamento texturizado, palco sonoro amplo e conectividade Bluetooth para a sala toda.",
    priceInCents: 129990,
    stock: 9,
    featured: false,
    imageUrl:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
    categorySlug: "audio-premium",
  },
  {
    name: "Monitor Canvas 27",
    slug: "monitor-canvas-27",
    description:
      "Monitor de 27 polegadas com painel de alta definicao, base ajustavel e visual minimalista para escritorio.",
    priceInCents: 179990,
    stock: 11,
    featured: true,
    imageUrl:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80",
    categorySlug: "workspace",
  },
  {
    name: "Teclado Flow Silent",
    slug: "teclado-flow-silent",
    description:
      "Teclado mecanico de perfil baixo com digitacao silenciosa, iluminacao suave e estrutura em aluminio.",
    priceInCents: 45990,
    stock: 27,
    featured: false,
    imageUrl:
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80",
    categorySlug: "workspace",
  },
  {
    name: "Difusor Calm Air",
    slug: "difusor-calm-air",
    description:
      "Difusor ultrassonico com luz ambiente, reservatorio amplo e operacao silenciosa para quartos e home office.",
    priceInCents: 21990,
    stock: 21,
    featured: false,
    imageUrl:
      "https://images.unsplash.com/photo-1600566753386-12c8ab7fb75b?auto=format&fit=crop&w=900&q=80",
    categorySlug: "bem-estar",
  },
  {
    name: "Massageador Ease Move",
    slug: "massageador-ease-move",
    description:
      "Massageador portatil com diferentes intensidades para aliviar tensoes depois de um dia intenso.",
    priceInCents: 33990,
    stock: 16,
    featured: true,
    imageUrl:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
    categorySlug: "bem-estar",
  },
];

async function main() {
  const adminPasswordHash = await bcrypt.hash("Admin123!", 12);

  await prisma.user.upsert({
    where: { email: "admin@lumestore.com" },
    update: {
      fullName: "Administrador Lume",
      role: "ADMIN",
      passwordHash: adminPasswordHash,
    },
    create: {
      fullName: "Administrador Lume",
      email: "admin@lumestore.com",
      role: "ADMIN",
      passwordHash: adminPasswordHash,
    },
  });

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  for (const product of products) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: product.categorySlug },
    });

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        priceInCents: product.priceInCents,
        stock: product.stock,
        featured: product.featured,
        imageUrl: product.imageUrl,
        categoryId: category.id,
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceInCents: product.priceInCents,
        stock: product.stock,
        featured: product.featured,
        imageUrl: product.imageUrl,
        categoryId: category.id,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
