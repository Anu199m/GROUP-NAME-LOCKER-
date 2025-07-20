const login = require("ws3-fca");
const fs = require("fs");
const express = require("express");

const appState = JSON.parse(fs.readFileSync("appstate.json", "utf-8"));

const GROUP_THREAD_ID = "24041654888825173";
const LOCKED_GROUP_NAME = "KUNDAN X RAJ CHINTU KI MAA KI CHUT ME MOOTNE WALA ANU HERE :)";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Anti-sleep: Keep web server running (pinged by UptimeRobot)
app.get("/", (req, res) => {
  res.send("✅ Bot is alive and locking group name.");
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// 🔁 Group name check loop
const startBot = (api) => {
  const checkLoop = async () => {
    try {
      api.getThreadInfo(GROUP_THREAD_ID, (err, info) => {
        if (err) {
          console.error("❌ Error fetching group info:", err);
        } else {
          if (info.name !== LOCKED_GROUP_NAME) {
            console.log(`⚠️ Name changed to "${info.name}" — will reset in 10 seconds...`);

            setTimeout(() => {
              api.setTitle(LOCKED_GROUP_NAME, GROUP_THREAD_ID, (err) => {
                if (err) {
                  console.error("❌ Failed to reset name:", err);
                } else {
                  console.log("🔒 Group name reset successfully after 10s.");
                }
              });
            }, 10000); // Delay 10 sec
          } else {
            console.log("✅ Group name is correct.");
          }
        }
      });
    } catch (e) {
      console.error("❌ Unexpected error:", e);
    }

    // 🔁 Repeat after 5 seconds
    setTimeout(checkLoop, 5000);
  };

  checkLoop(); // Start loop
};

// 🟢 Login to Facebook
login({ appState }, (err, api) => {
  if (err) {
    console.error("❌ Login Failed:", err);
    return;
  }

  console.log("✅ Logged in successfully");
  startBot(api);
});
