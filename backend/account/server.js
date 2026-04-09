import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/healthai";
const JWT_SECRET = process.env.JWT_SECRET || "change-me";
const PORT = process.env.PORT || 4000;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log(`✅ MongoDB connecté à ${MONGO_URI}`))
  .catch((err) => console.error("❌ Impossible de connecter MongoDB :", err));

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model("User", userSchema);

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token manquant ou invalide" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalide" });
  }
};

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "account" });
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Utilisateur déjà existant" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d"
    });

    res.status(201).json({ token, email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur lors de l'inscription" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d"
    });

    res.json({ token, email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur lors de la connexion" });
  }
});

app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("email createdAt");
    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }
    res.json({ email: user.email, createdAt: user.createdAt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur lors de la lecture du profil" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Account service en écoute sur http://0.0.0.0:${PORT}`);
});
