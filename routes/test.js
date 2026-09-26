const express = require("express");
const router = express.Router();

const { listingQueue } = require("../queues/listingQueue.js");

router.get("/test-email", async (req, res) => {

    await listingQueue.add("sendListingEmail", {
        email: "palpupai37@gmail.com",
        listingTitle: "Test Listing 1"
    });

    await listingQueue.add("sendListingEmail", {
        email: "tsusovancource@gmail.com",
        listingTitle: "Test Listing 2"
    });

    res.send("2 email jobs added to queue!");
});

module.exports = router;