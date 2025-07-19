const login = require("ws3-fca");
const fs = require("fs");
const express = require("express");

// Read appstate (session)
let appState;
try {
  appState = JSON.parse(fs.readFileSync("appstate.json", "utf-8"));
} catch (e) {
  console.error("❌ appstate.json not found or invalid. Please add a valid session file.");
  process.exit(1);
}

// Group details
const GROUP_THREAD_ID = "24041654888825173";
const LOCKED_GROUP_NAME = "KUNDAN X RAJ CHINTU KI MAA KI CHUT ME MOOTNE WALA ANU HERE :)";

// Timings
const CHECK_INTERVAL = 60000;  // 1 min
const RENAME_DELAY = 60000;    // 1 min delay before rename
const MAX_CHANGES_PER_DAY = 40;

let changesToday = 0;
let lastReset = Date.now();

function resetCounterIfNewDay() {
  if (Date.now() - lastReset >= 24 * 60 * 60 * 1000) {
    changesToday = 0;
    lastReset = Date.now();
  }
}

function startBot(api) {
  console.log("✅ Bot Started: Group Name Locker Active!");

  const monitor = () => {
    resetCounterIfNewDay();

    api.getThreadInfo(GROUP_THREAD_ID, (err, info) => {
      if (err) {
        console.error("❌ Failed to get group info:", err);
      } else {
        if (info.name !== LOCKED_GROUP_NAME) {
          console.log(`⚠️ Group name changed to "${info.name}". Will reset in 1 minute...`);

          if (changesToday < MAX_CHANGES_PER_DAY) {
            setTimeout(() => {
              api.setTitle(LOCKED_GROUP_NAME, GROUP_THREAD_ID, (err) => {
                if (err) {
                  console.error("❌ Failed to reset name:", err);
                } else {
                  changesToday++;
                  console.log(`🔒 Group name reset. Total resets today: ${changesToday}`);
                }
              });
            }, RENAME_DELAY);
          } else {
            console.warn("⚠️ Daily change limit reached. Skipping rename to avoid ban.");
          }
        } else {
          console.log("✅ Group name is correct.");
        }
      }

      setTimeout(monitor, CHECK_INTERVAL);
    });
  };

  monitor();
}

// Login to Facebook
login({ appState }, (err, api) => {
  if (err) {
    console.error("❌ Login failed:", err);
    return;
  }

  console.log("✅ Logged in successfully");
  startBot(api);
});

// Keep-alive server for Render
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("✅ Bot is running and alive."));
app.listen(PORT, () => console.log(`🌐 Web server running on port ${PORT}`));
