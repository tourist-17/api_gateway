const express = require("express");
const morgan = require("morgan");
const ratelimit = require("express-rate-limit");
const axios = require("axios");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();

const PORT = 3005;

const limiter = ratelimit({
  windowMs: 2 * 60 * 1000,
  max: 5,
});

app.use(morgan("combined"));
app.use(limiter);
app.use("/bookingservice", async (req, res, next) => {
  //   console.log(req.headers["x-access-token"]);

  try {
    const response = await axios.get(
      "http://localhost:3002/api/v1/isauthenticated",
      {
        headers: {
          "x-access-token": req.headers["x-access-token"],
        },
      }
    );
    if (response.data.success) {
      next();
    } else {
      return res.status(401).json({
        message: "Unauthorised",
      });
    }
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorised",
    });
  }
});
app.use(
  "/bookingservice",
  createProxyMiddleware({
    target: "http://localhost:3003/",
    changeOrigin: true,
  })
);
app.get("/home", (req, res) => {
  return res.json({ message: "OK" });
});

app.listen(PORT, () => {
  console.log(`Server Started at port ${PORT}`);
});
