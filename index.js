const login = require("ws3-fca");
const fs = require("fs");
const express = require("express");

const appState = JSON.parse(fs.readFileSync("appstate.json", "utf-8"));

const GROUP_THREAD_ID = "24041654888825173";
const LOCKED_GROUP_NAME = "KUNDAN X RAJ CHINTU KI MAA KI CHUT ME MOOTNE WALA ANU HERE :)";

const checkGroupNameLoop = (api) => {
  const check = async () => {
    api.getThreadInfo(GROUP_THREAD_ID, (err, info) => {
      if (err) {
        console.error("Error getting thread info:", err);
      } else {
        if (info.name !== LOCKED_GROUP_NAME) {
          console.log(`⚠️ Group name changed to "${info.name}", resetting in 10 seconds...`);

          // 🔁 10-second delay before changing name
          setTimeout(() => {
            api.setTitle(LOCKED_GROUP_NAME, GROUP_THREAD_ID, (err) => {
              if (err) {
                console.error("❌ Failed to reset name:", err);
              } else {
                console.log("🔒 Group name reset successfully after 10 seconds.");
              }
            });
          }, 10000); // 10 seconds
        } else {
          console.log("✅ Group name is correct.");
        }
      }

      // 🔁 Repeat check every 5 sec
      setTimeout(check, 5000);
    });
  };

  check(); // Start loop
};

// 🟢 Login and Start Bot
login({ appState }, (err, api) => {
  if (err) {
    console.error("❌ Login Failed:", err);
    return;
  }

  console.log("✅ Logged in successfully");
  console.log("✅ Bot Started: Group Name Locker Active!");

  checkGroupNameLoop(api);
});

// 🌐 Dummy Express Server to keep alive on Render
const server = express();
const PORT = process.env.PORT || 3000;

server.get("/", (req, res) => {
  res.send("✅ Bot is running and alive.");
  res.end();
});

server.listen(PORT, () => {
  console.log(`🌐 Web server started on port ${PORT}`);
});
