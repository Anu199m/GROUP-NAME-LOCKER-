const login = require("ws3-fca");
const fs = require("fs");
const express = require("express");

const appState = JSON.parse(fs.readFileSync("appstate.json", "utf-8"));

const GROUP_THREAD_ID = "9909298062530889";
const LOCKED_GROUP_NAME = "NAME CHANGER TESTING:)";

// 🟢 Login and Start Bot
login({ appState }, (err, api) => {
  if (err) {
    console.error("❌ Login Failed:", err);
    return;
  }

  console.log("✅ Logged in successfully");
  console.log("✅ Bot Started: Group Name Locker Active!");

  // 🔁 Check group name every 60 sec
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
  }, 60000); // Every 60 seconds
});

// 🌐 Dummy Express Server to keep alive on Render
const server = express();
const PORT = process.env.PORT || 3000;

server.get("/", (req, res) => {
  res.send("✅ Bot is running and alive.");
  res.end(); // ensure response ends cleanly
});

server.listen(PORT, () => {
  console.log(`🌐 Web server started on port ${PORT}`);
});
