const express = require("express");
const app = express();
const port = 3000;

app.use(express.static("public"));
app.get("/", (req, res) => {
    res.redirect("/pdflinks.html");
});
// app.get("/myExtractor.js", (req, res) => {
//     res.sendFile("", { root: __dirname });
// });

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
