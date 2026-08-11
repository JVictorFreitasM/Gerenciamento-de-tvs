const express = require("express");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const { createClient } = require("redis");

const { idpAuth } = require("./src/lib/idpAuth");
const { createTvAccessMiddleware } = require("./src/middleware/tvAccess");

const apiRoutes = require("./src/routes/api.routes");
const tvRoutes = require("./src/routes/tv.routes");

const app = express();

// OS 12-C, secao 4: front (Vite/nginx, porta propria) e backend (5001)
// passam a ser origens diferentes. Em dev/prod o proxy do Vite/nginx faz a
// maioria das chamadas de /api parecerem same-origin pro navegador, mas o
// CORS fica explicito mesmo assim - mesmo cuidado do Contracheque Bot.
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "http://localhost:5002")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // false (nao Error) - segue sem os headers de CORS em vez de
        // estourar um 500 com stack trace/caminho de arquivo pro cliente;
        // o navegador bloqueia a leitura da resposta do mesmo jeito.
        return callback(null, false);
    },
    credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// OS 12-C, secao 3.1: view engine mantida SO pra rota de TV fisica
// (/tv/:identificador -> player.ejs/player-diretoria.ejs) - nao faz parte
// da SPA, continua servindo HTML pro dispositivo. Todas as rotas humanas
// agora sao JSON (ver src/routes/api.routes.js).
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

// OS 12-B: sessao local do backend - guarda access/refresh token do IdP
// (nunca no front, so o cookie httpOnly de sessao chega ao navegador).
// Redis como store pra sobreviver a restarts do container, mesmo padrao
// do Farol (OS-009-C).
const redisClient = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
redisClient.on("error", (err) => console.error("Erro na conexão com o Redis:", err));
redisClient.connect().catch((err) => console.error("Falha ao conectar no Redis:", err));

app.use(
    session({
        store: new RedisStore({ client: redisClient }),
        secret: process.env.SESSION_SECRET || "dev-session-secret-change-in-production",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === "true",
            sameSite: "lax"
        }
    })
);

// GET /auth/login, /auth/callback, /auth/logout (OS 12-B, secao 3.2/3.3).
app.use(idpAuth.router);

// OS 12-B, secao 3.9: /videos e /uploads sao consumidas pelas TVs fisicas
// (accessToken), nunca por sessao de usuario humano. OS 12-C, secao 3.1/6:
// mantidas exatamente como estao, fora da SPA.
app.use(
    "/videos",
    createTvAccessMiddleware({ enforceSetorPath: true }),
    express.static(path.join(__dirname, "videos"))
);
app.use(
    "/uploads",
    createTvAccessMiddleware({ enforceSetorPath: false }),
    express.static("uploads")
);

app.use(tvRoutes);

app.use("/api", apiRoutes);

module.exports = app;
