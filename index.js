const login = require("ws3-fca");
const fs = require("fs");

const appState = JSON.parse(fs.readFileSync("appstate.json", "utf-8"));

const GROUP_THREAD_ID = "9909298062530889";
const LOCKED_GROUP_NAME = "NAME CHANGER TESTING:)";

login({ appState }, (err, api) => {
  if (err) return console.error("Login Failed:", err);

  console.log("✅ Bot Started: Group Name Locker Active!");

  setInterval(() => {
    api.getThreadInfo(GROUP_THREAD_ID, (err, info) => {
      if (err) return console.error("Error getting thread info:", err);

      if (info.name !== LOCKED_GROUP_NAME) {
        console.log(`⚠️ Group name changed to "${info.name}", resetting...`);
        api.setTitle(LOCKED_GROUP_NAME, GROUP_THREAD_ID, (err) => {
          if (err) {
            console.error("❌ Failed to reset name:", err);
          } else {
            console.log("🔒 Group name reset successfully.");
          }
        });
      } else {
        console.log("✅ Group name is correct.");
      }
    });
  }, 60000); // Check every 60 sec
});

// 🟢 Dummy Express server to keep Render service alive
const express = require("express");
const server = express();

const PORT = process.env.PORT || 3000;
server.get("/", (req, res) => res.send("Bot is running!"));
server.listen(PORT, () => console.log(`🌐 Web server started on port ${PORT}`));
