const { default: login } = require("ws3-fca");
const fs = require("fs");
const express = require("express");

// Load appstate
let appState;
try {
  appState = JSON.parse(fs.readFileSync("appstate.json", "utf-8"));
} catch (e) {
  console.error("❌ ERROR: 'appstate.json' missing or invalid. Add your Facebook session file!");
  process.exit(1);
}

// Group details
const GROUP_THREAD_ID = "24041654888825173";
const LOCKED_GROUP_NAME = "KUNDAN X RAJ CHINTU KI MAA KI CHUT ME MOOTNE WALA ANU HERE :)";

// Web server
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("✅ Bot is alive and monitoring group name."));
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));

// Monitor loop (60 sec)
const startBot = (api) => {
  const checkLoop = () => {
    api.getThreadInfo(GROUP_THREAD_ID, (err, info) => {
      if (err) {
        console.error("❌ Error fetching group info:", err);
      } else if (!info) {
        console.error("❌ No group info returned.");
      } else if (info.name !== LOCKED_GROUP_NAME) {
        console.log(`⚠️ Name changed to "${info.name}". Resetting in 10s...`);
        setTimeout(() => {
          api.setTitle(LOCKED_GROUP_NAME, GROUP_THREAD_ID, (err2) => {
            if (err2) console.error("❌ Failed to reset:", err2);
            else console.log("🔒 Reset successful.");
          });
        }, 10000);
      } else {
        console.log("✅ Name is correct.");
      }
    });
    setTimeout(checkLoop, 60000);
  };
  checkLoop();
};

// Facebook login
login({ appState }, (err, api) => {
  if (err) {
    console.error("❌ Login failed:", err);
    return;
  }
  console.log("✅ Logged in!");
  startBot(api);
});
