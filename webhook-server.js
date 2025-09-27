const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");

const app = express();
const PORT = 5000; // Puerto para escuchar el webhook

app.use(bodyParser.json());

app.post("/github-webhook", (req, res) => {
  const event = req.headers["x-github-event"];
  if (event === "push") {
    console.log("🔔 Push recibido desde GitHub. Ejecutando deploy...");
    exec("./deploy.sh", (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) console.error(`stderr: ${stderr}`);
      console.log(`stdout: ${stdout}`);
    });
    res.status(200).send("Deploy iniciado");
  } else {
    res.status(200).send("Evento ignorado");
  }
});

app.listen(PORT, () => {
  console.log(`Webhook escuchando en puerto ${PORT}`);
});
