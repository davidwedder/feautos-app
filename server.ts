import express, { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import multer from "multer";
import session from "express-session";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { prisma } from "./src/lib/db";
import { uploadToBlob, deleteFromBlob } from "./src/lib/blob";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Configuração para confiar no proxy (essencial para cookies seguros em iframes)
app.set("trust proxy", 1);

// Servir arquivos locais enviados em dev
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Multer Setup for Image Uploads (temporary, will be uploaded to Vercel Blob)
const storage = multer.memoryStorage(); // Store in memory, then upload to Blob
const upload = multer({
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit per file (before compression)
    files: 10 // Maximum 10 images per vehicle
  },
});

// Upload fallback local (quando não houver token do Vercel Blob)
const localUploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

const saveBufferToLocalUploads = async (buffer: Buffer, filename: string): Promise<string> => {
  const safeName = filename.replace(/[^a-zA-Z0-9._/-]/g, "_").replace(/\.\./g, "_");
  const base = path.basename(safeName);
  const outName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${base}`;
  const outPath = path.join(localUploadsDir, outName);
  fs.writeFileSync(outPath, buffer);
  return `/uploads/${outName}`;
};

const uploadPublicFile = async (buffer: Buffer, filename: string): Promise<string> => {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return await uploadToBlob(buffer, filename);
  }
  return await saveBufferToLocalUploads(buffer, filename);
};

// Compress image buffer using Sharp
const compressImage = async (buffer: Buffer): Promise<Buffer> => {
  try {
    // Compress to WebP format with quality 80%, max width/height 1200px
    return await sharp(buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch (error) {
    console.error('Erro ao comprimir imagem:', error);
    // Return original buffer if compression fails
    return buffer;
  }
};

// Body parsers & Session Setup
// Uploads em Base64 (carros / hero / sobre nós) podem passar de 10mb.
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || "fe-autos-secret",
    resave: true,
    saveUninitialized: true,
    name: "feautos.sid",
    proxy: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 semana
    },
  })
);

// Auth Middleware usando sessão local
const isAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const user = (req.session as any)?.user;
  console.log(`[Auth Check] Path: ${req.url}, User: ${user ? user.email || "Sim" : "Não"}`);

  if (user) {
    return next();
  }
  res
    .status(401)
    .json({ error: "Sessão expirada ou não autorizado. Por favor, faça login novamente." });
};

// --- Autenticação local (usuário/senha simples) ---
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@feautos.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
  }

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    (req.session as any).user = { email };
    return res.json({ success: true, user: { email } });
  }

  return res.status(401).json({ error: "Credenciais inválidas." });
});

// Store settings API
app.get("/api/store-settings", async (req, res) => {
  try {
    const settings = await prisma.store_settings.findUnique({
      where: { id: 1 },
    });
    if (!settings) {
      return res.status(404).json({ error: "Configurações da loja não encontradas" });
    }

    // Normaliza para camelCase no front
    res.json({
      id: settings.id,
      phone: settings.phone,
      email: settings.email,
      address: settings.address,
      hoursWeek: settings.hours_week,
      hoursSaturday: settings.hours_saturday,
      hoursSunday: settings.hours_sunday,
      instagramUrl: settings.instagram_url,
      facebookUrl: settings.facebook_url,
      heroImageUrl: settings.hero_image_url,
      aboutImageUrl: settings.about_image_url,
    });
  } catch (err: any) {
    console.error("Erro ao carregar configurações da loja:", err);
    res.status(500).json({ error: "Erro ao carregar configurações" });
  }
});

app.post("/api/store-settings", isAdmin, upload.single("heroImage"), async (req, res) => {
  try {
    const {
      phone,
      email,
      address,
      hoursWeek,
      hoursSaturday,
      hoursSunday,
      instagramUrl,
      facebookUrl,
      new_hero_image,
      new_about_image,
    } = req.body;

    let finalHeroImageUrl = req.body.heroImageUrl;
    let finalAboutImageUrl = req.body.aboutImageUrl;

    // Upload hero image se enviada em base64
    if (
      new_hero_image &&
      typeof new_hero_image === "string" &&
      new_hero_image.includes(";base64,")
    ) {
      try {
        const parts = new_hero_image.split(";base64,");
        const mime = parts[0].split(":")[1] || "image/jpeg";
        const data = parts[1];
        const buffer = Buffer.from(data, "base64");

        const filename = `hero-${Date.now()}.${mime.split("/")[1] || "jpg"}`;
        finalHeroImageUrl = await uploadPublicFile(buffer, `store/${filename}`);
      } catch (e) {
        console.error("Erro ao processar nova imagem do HERO:", e);
      }
    }

    // Upload about image se enviada em base64
    if (
      new_about_image &&
      typeof new_about_image === "string" &&
      new_about_image.includes(";base64,")
    ) {
      try {
        const parts = new_about_image.split(";base64,");
        const mime = parts[0].split(":")[1] || "image/jpeg";
        const data = parts[1];
        const buffer = Buffer.from(data, "base64");

        const filename = `about-${Date.now()}.${mime.split("/")[1] || "jpg"}`;
        finalAboutImageUrl = await uploadPublicFile(buffer, `store/${filename}`);
      } catch (e) {
        console.error("Erro ao processar nova imagem da seção Sobre Nós:", e);
      }
    }

    const updated = await prisma.store_settings.update({
      where: { id: 1 },
      data: {
        phone,
        email,
        address,
        hours_week: hoursWeek,
        hours_saturday: hoursSaturday,
        hours_sunday: hoursSunday,
        instagram_url: instagramUrl,
        facebook_url: facebookUrl,
        hero_image_url: finalHeroImageUrl,
        about_image_url: finalAboutImageUrl,
      },
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("Erro ao salvar configurações da loja:", err);
    res.status(500).json({ error: "Erro ao salvar configurações" });
  }
});

// Get all cars
app.get("/api/cars", async (req, res) => {
  try {
    const cars = await prisma.cars.findMany({
      orderBy: { created_at: "desc" },
    });
    res.json(cars);
  } catch (error) {
    console.error("Erro ao buscar carros:", error);
    res.status(500).json({ error: "Erro interno ao buscar carros" });
  }
});

// Helper para limpar formatação de números
const cleanNumber = (val: any): number => {
  if (!val) return 0;
  if (typeof val === "number") return val;
  const cleaned = val.toString().replace(/\./g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
};

// Create car
app.post("/api/cars", isAdmin, upload.array("images"), async (req, res) => {
  try {
    console.log(">>> [POST /api/cars] Recebendo nova inserção...");
    const { brand, model, year, price, mileage, fuel, transmission, status, description } =
      req.body;

    if (!brand || !model) {
      return res.status(400).json({ error: "Marca e Modelo são obrigatórios" });
    }

    const yearNum = parseInt(year) || new Date().getFullYear();
    const priceNum = cleanNumber(price);
    const mileageNum = cleanNumber(mileage);

    // Upload images to Vercel Blob with compression
    const imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        try {
          // Compress the image first
          const compressedBuffer = await compressImage(file.buffer);
          
          // Generate filename with .webp extension
          const originalName = file.originalname.replace(/\.[^/.]+$/, ""); // Remove extension
          const filename = `cars/${Date.now()}-${Math.random().toString(36).substring(7)}-${originalName}.webp`;
          
          const url = await uploadPublicFile(compressedBuffer, filename);
          imageUrls.push(url);
        } catch (uploadErr) {
          console.error("Erro ao upload de imagem:", uploadErr);
        }
      }
    }

    const car = await prisma.cars.create({
      data: {
        brand,
        model,
        year: yearNum,
        price: priceNum,
        mileage: mileageNum,
        fuel: fuel || "Flex",
        transmission: transmission || "Automático",
        status: status || "available",
        images: imageUrls,
        description: description || "",
      },
    });

    console.log(">>> [Success] Veículo cadastrado!");
    return res.status(200).json({ id: car.id, success: true });
  } catch (error: any) {
    console.error(">>> [Error]:", error);
    return res.status(500).json({ error: "Erro no servidor: " + error.message });
  }
});

// Update car
app.put("/api/cars/:id", isAdmin, upload.array("images"), async (req, res) => {
  try {
    console.log("Atualizando carro ID:", req.params.id);
    const { brand, model, year, price, mileage, fuel, transmission, status, description, existingImages } =
      req.body;

    const yearNum = parseInt(year) || new Date().getFullYear();
    const priceNum = cleanNumber(price);
    const mileageNum = cleanNumber(mileage);

    // Upload new images to Vercel Blob with compression
    const newImageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        try {
          // Compress the image first
          const compressedBuffer = await compressImage(file.buffer);
          
          // Generate filename with .webp extension
          const originalName = file.originalname.replace(/\.[^/.]+$/, ""); // Remove extension
          const filename = `cars/${Date.now()}-${Math.random().toString(36).substring(7)}-${originalName}.webp`;
          
          const url = await uploadPublicFile(compressedBuffer, filename);
          newImageUrls.push(url);
        } catch (uploadErr) {
          console.error("Erro ao upload de imagem:", uploadErr);
        }
      }
    }

    const existingImagesArray = JSON.parse(existingImages || "[]");
    const allImages = [...existingImagesArray, ...newImageUrls];

    const car = await prisma.cars.update({
      where: { id: parseInt(req.params.id) },
      data: {
        brand,
        model,
        year: yearNum,
        price: priceNum,
        mileage: mileageNum,
        fuel,
        transmission,
        status,
        images: allImages,
        description,
      },
    });

    console.log("Carro atualizado com sucesso!");
    res.json({ success: true, data: car });
  } catch (error: any) {
    console.error("Erro ao atualizar carro:", error);
    res.status(500).json({ error: "Erro ao atualizar: " + error.message });
  }
});

// Delete car
app.delete("/api/cars/:id", isAdmin, async (req, res) => {
  try {
    // Get car to delete images from Blob
    const car = await prisma.cars.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (car && car.images && Array.isArray(car.images)) {
      for (const imageUrl of car.images) {
        try {
          await deleteFromBlob(imageUrl);
        } catch (e) {
          console.error("Erro ao deletar imagem:", e);
        }
      }
    }

    await prisma.cars.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao deletar carro:", error);
    res.status(500).json({ error: "Erro ao deletar: " + error.message });
  }
});

// Auth endpoints
app.get("/api/auth/me", (req, res) => {
  const user = (req.session as any)?.user || null;
  res.json({ user });
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("Erro ao encerrar sessão local:", err);
    res.clearCookie("feautos.sid", {
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return res.status(200).json({ success: true });
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    const indexPath = path.join(distPath, "index.html");
    
    // Serve static files from dist
    app.use(express.static(distPath, { maxAge: "1d" }));
    
    // SPA fallback - catch all non-API routes and serve index.html
    app.use((req, res, next) => {
      // Skip API routes
      if (req.path.startsWith("/api/")) {
        return next();
      }
      
      // Skip file requests (have extensions)
      const ext = path.extname(req.path);
      if (ext) {
        return next();
      }
      
      // Serve index.html for all SPA routes
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Not found");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Erro ao iniciar servidor:", err);
  process.exit(1);
});
