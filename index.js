const login = require("ws3-fca");
const fs = require("fs");
const express = require("express");

// Load appstate
let appState;
try {
  appState = JSON.parse(fs.readFileSync("appstate.json", "utf-8"));
} catch (e) {
  console.error("❌ ERROR: 'appstate.json' file missing or invalid. Please add your Facebook session.");
  process.exit(1);
}

// Group details
const GROUP_THREAD_ID = "24041654888825173";
const LOCKED_GROUP_NAME = "KUNDAN X RAJ CHINTU KI MAA KI CHUT ME MOOTNE WALA ANU HERE :)";

// Web server for Render (keeps app alive)
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("✅ Bot is alive and locking group name."));
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));

// Function to monitor group name (every 60 seconds)
const startBot = (api) => {
  const checkLoop = async () => {
    try {
      api.getThreadInfo(GROUP_THREAD_ID, (err, info) => {
        if (err) {
          console.error("❌ Error fetching group info:", err);
          return;
        }
        if (!info) {
          console.error("❌ No group info returned. Skipping...");
          return;
        }

        if (info.name !== LOCKED_GROUP_NAME) {
          console.log(`⚠️ Group name changed to "${info.name}". Will reset in 10s...`);
          setTimeout(() => {
            api.setTitle(LOCKED_GROUP_NAME, GROUP_THREAD_ID, (err) => {
              if (err) {
                console.error("❌ Failed to reset name:", err);
              } else {
                console.log("🔒 Group name reset successfully.");
              }
            });
          }, 10000);
        } else {
          console.log("✅ Group name is correct.");
        }
      });
    } catch (e) {
      console.error("❌ Unexpected error:", e);
    }
    // Run this function again after 60 seconds
    setTimeout(checkLoop, 60000);
  };

  checkLoop();
};

// Facebook login
login({ appState }, (err, api) => {
  if (err) {
    console.error("❌ Facebook Login Failed:", err);
    return;
  }
  console.log("✅ Logged in successfully!");
  startBot(api);
});
