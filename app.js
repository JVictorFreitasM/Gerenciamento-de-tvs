const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

const authRoutes = require("./src/routes/auth.routes");
const mediaRoutes = require("./src/routes/media.routes");

const app = express();

const auth = require("./src/middleware/auth");
const prisma = require("./src/prisma/client");

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

app.use("/videos", express.static(path.join(__dirname, "videos")));
app.use("/uploads", express.static("uploads"));

app.get(
    "/dashboard",
    auth,
    async (req, res) => {

        try {

            const userId =
                req.user && req.user.id;

            const user =
                await prisma.user.findUnique({

                    where: {
                        id: userId
                    }

                });

            if (!user) {

                res.clearCookie("token");

                return res.redirect("/login");

            }

            let setores;

            if (user.role === "ti") {

                setores =
                    await prisma.setor.findMany({

                        select: {
                            nome: true
                        }

                    });

            } else {

                setores =
                    await prisma.setor.findMany({

                        where: {
                            nome: user.role
                        },

                        select: {
                            nome: true
                        }

                    });

            }

            const setoresList =
                setores.map(
                    s => s.nome.toLowerCase()
                );

            res.render("painel", {

                user,

                setores: setoresList

            });

        } catch (err) {

            res.status(500).send(err.message);

        }

    }
);

app.use(authRoutes);
app.use(mediaRoutes);

module.exports = app;