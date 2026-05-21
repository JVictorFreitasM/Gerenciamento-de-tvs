const multer = require("multer");

const path = require("path");

const fs = require("fs");


const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        const setor =
            req.params.setor || "geral";

        const dir = path.join(
            __dirname,
            "../../videos",
            setor
        );

        if (!fs.existsSync(dir)) {

            fs.mkdirSync(dir, {
                recursive: true
            });

        }

        cb(null, dir);

    },

    filename: (req, file, cb) => {

        const extensao =
            path.extname(file.originalname);

        cb(
            null,
            "media" + extensao
        );

    }

});


module.exports =
    multer({ storage });