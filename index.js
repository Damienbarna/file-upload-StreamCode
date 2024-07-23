const { Sequelize } = require("sequelize");

const login = {
  database: "streamcode",
  username: "admin",
  password: "admin",
};

const sequelize = new Sequelize(
  login.database,
  login.username,
  login.password,
  {
    host: "localhost",
    dialect: "mysql",
  }
);
sequelize
  .authenticate()
  .then(() => console.log("connecté à la bdd"))
  .catch((error) =>
    console.error("impossible de ca connecter à la bdd :", error)
  );

sequelize.sync({ force: true }).then(async () => {
  console.log("Modèles et tables synchronisésssssss.");
});

module.exports.sequelize = sequelize;
