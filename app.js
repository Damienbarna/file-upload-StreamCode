const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const {
  Products,
} = require("../api-crud-StreamCode/src/models/modelProducts.js");
const User = require("../api-crud-StreamCode/src/models/modelUser.js"); // Assurez-vous d'importer le modèle User

const app = express();

// Vérifiez si le dossier 'public' existe, sinon créez-le
const publicDir = path.join(__dirname, "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

app.use(cors());
app.use(fileUpload());
app.use(express.static("public"));

// Route pour l'upload de produits
app.post("/upload", async (req, res) => {
  console.log("Requête /upload reçue");
  console.log("req.files:", req.files);
  console.log("req.body:", req.body);

  const image = req.files?.image;
  if (!req.body.productData) {
    return res.status(400).json({ msg: "Aucune donnée de produit fournie" });
  }

  let productData;
  try {
    productData = JSON.parse(req.body.productData);
  } catch (err) {
    console.error("Erreur lors du parsing de productData:", err);
    return res.status(400).json({ msg: "Données JSON invalides" });
  }

  if (!image) {
    return res.status(400).json({ msg: "Aucune image envoyée par le client" });
  }

  const extensionFile = image.name.split(".").pop();
  const fileName = image.name.split(".")[0];
  const completeFileName = `${fileName}_${Date.now()}.${extensionFile}`;
  const uploadPath = path.join(__dirname, "public", completeFileName);

  image.mv(uploadPath, async (err) => {
    if (err) {
      console.error("Erreur lors du téléchargement de l'image :", err);
      return res
        .status(500)
        .json({ msg: "Erreur lors du téléchargement de l'image" });
    }
    const imageUrl = `http://localhost:3001/${completeFileName}`;

    try {
      const newProduct = await Products.create({
        ...productData,
        image: imageUrl,
      });
      res.status(201).json(newProduct);
    } catch (error) {
      console.error(
        "Erreur lors de l'ajout du produit dans la base de données :",
        error
      );
      res.status(500).json({
        msg: "Erreur lors de l'ajout du produit dans la base de données",
      });
    }
  });
});

// Route pour l'upload de la photo de profil
app.post("/upload-profile", async (req, res) => {
  console.log("Requête /upload-profile reçue");
  console.log("req.files:", req.files);
  console.log("req.body:", req.body);

  const image = req.files?.image;
  const userId = req.body.userId;

  if (!userId) {
    return res.status(400).json({ msg: "Aucun userId fourni" });
  }

  if (!image) {
    return res.status(400).json({ msg: "Aucune image envoyée par le client" });
  }

  const extensionFile = image.name.split(".").pop();
  const fileName = image.name.split(".")[0];
  const completeFileName = `${fileName}_${Date.now()}.${extensionFile}`;
  const uploadPath = path.join(__dirname, "public", completeFileName);

  image.mv(uploadPath, async (err) => {
    if (err) {
      console.error("Erreur lors du téléchargement de l'image :", err);
      return res
        .status(500)
        .json({ msg: "Erreur lors du téléchargement de l'image" });
    }
    const imageUrl = `http://localhost:3001/${completeFileName}`;

    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ msg: "Utilisateur non trouvé" });
      }

      user.imageUrl = imageUrl;
      await user.save();

      res.status(200).json({ imageUrl });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
      res
        .status(500)
        .json({ msg: "Erreur lors de la mise à jour de l'utilisateur" });
    }
  });
});

app.listen(3001, () => {
  console.log("Serveur démarré sur le port 3001");
});
