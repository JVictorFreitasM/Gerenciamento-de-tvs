require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    const agora = new Date();
    console.log(`Servidor rodando em http://localhost:${PORT} ${agora.toLocaleString()}`);
});

