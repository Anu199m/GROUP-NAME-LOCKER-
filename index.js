const login = require("ws3-fca");
const fs = require("fs");
const express = require("express");

const appState = JSON.parse(fs.readFileSync("appstate.json", "utf-8"));

// Group details
const GROUP_THREAD_ID = "24041654888825173";
const LOCKED_GROUP_NAME = "KUNDAN X RAJ CHINTU KI MAA KI CHUT ME MOOTNE WALA ANU HERE :)";

// Configurable timings
const CHECK_INTERVAL = 60000;  // 1 minute
const RENAME_DELAY = 60000;    // 1 minute delay before rename
const MAX_CHANGES_PER_DAY = 40; // Avoid FB bans

let changesToday = 0;
let lastReset = Date.now();

// Function to reset daily counter
const resetCounterIfNewDay = () => {
  if (Date.now() - lastReset >= 24 * 60 * 60 * 1000) {
    changesToday = 0;
    lastReset = Date.now();
  }
};

// Group name monitor
const checkGroupNameLoop = (api) => {
  const check = async () => {
    resetCounterIfNewDay();

    api.getThreadInfo(GROUP_THREAD_ID, (err, info) => {
      if (err) {
        console.error("Error getting thread info:", err);
      } else {
        if (info.name !== LOCKED_GROUP_NAME) {
          console.log(`⚠️ Group name changed to "${info.name}", resetting in 1 minute...`);

          if (changesToday < MAX_CHANGES_PER_DAY) {
            setTimeout(() => {
              api.setTitle(LOCKED_GROUP_NAME, GROUP_THREAD_ID, (err) => {
                if (err) {
                  console.error("❌ Failed to reset name:", err);
                } else {
                  changesToday++;
                  console.log(`🔒 Group name reset. Total changes today: ${changesToday}`);
                }
              });
            }, RENAME_DELAY);
          } else {
            console.warn("⚠️ Daily change limit reached, skipping rename to avoid ban.");
          }
        } else {
          console.log("✅ Group name is correct.");
        }
      }

      setTimeout(check, CHECK_INTERVAL);
    });
  };

  check(); // Start loop
};

// Login and start bot
login({ appState }, (err, api) => {
  if (err) {
    console.error("❌ Login Failed:", err);
    return;
  }

  console.log("✅ Logged in successfully");
  console.log("✅ Stable Group Name Locker Started!");

  checkGroupNameLoop(api);
});

// Dummy Express Server to keep Render alive
const server = express();
const PORT = process.env.PORT || 3000;

server.get("/", (req, res) => {
  res.send("✅ Bot is running and stable.");
  res.end();
});

server.listen(PORT, () => {
  console.log(`🌐 Web server started on port ${PORT}`);
});
