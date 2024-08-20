const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const {
  Products,
} = require("../api-crud-StreamCode/src/models/modelProducts.js");

// Vérifiez si le dossier 'public' existe, sinon créez-le
const publicDir = path.join(__dirname, "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

app.use(cors());
app.use(fileUpload());
app.use(express.static("public"));

app.post("/upload", async (req, res) => {
  const image = req.files.image;
  const productData = JSON.parse(req.body.productData);

  if (!image) {
    return res.status(400).json({ msg: "No image sent by the client" });
  }
  const extensionFile = image.name.split(".").pop();
  const fileName = image.name.split(".")[0];
  const completeFileName = `${fileName}_${Date.now()}.${extensionFile}`;
  const uploadPath = path.join(__dirname, "public", completeFileName);

  image.mv(uploadPath, async (err) => {
    if (err) {
      console.error("Error uploading image:", err);
      return res.status(500).json({ msg: "Error uploading image" });
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

app.listen(3001, () => {
  console.log("Server listen on port 3001");
});
