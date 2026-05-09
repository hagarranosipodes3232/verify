const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Sistema Verify online");
});

app.listen(3000, () => {
    console.log("Web online en puerto 3000");
});