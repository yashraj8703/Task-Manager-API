const express = require("express");
const app = express();

const tasksRouter = require("./routes/tasks");
const connectDB = require("./db/connect");

// IMPORTANT: import from middleware, not errors
const notFound = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

require("dotenv").config();

const port = process.env.PORT || 3000;

// ---------------- MIDDLEWARE ----------------
app.use(express.json());
app.use(express.static("./public"));

// ---------------- ROUTES ----------------
app.use("/api/v1/tasks", tasksRouter);

// ---------------- ERROR HANDLING ----------------

// 404 middleware (must come after routes)
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandlerMiddleware);

// ---------------- SERVER START ----------------
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

  } catch (error) {
    console.log(error);
  }
};

start();

// app.get("/normal-error", (req, res) => {
//   throw new Error("oops");
// });

//! About async error catching behaviour for express
// app.get("/async-error", async (req, res) => {
//   try {
//     await new Promise((res, rej) => {
//       setTimeout(() => {
//         rej(new Error("something went wrong"));
//       }, 1000);
//     });
//     res.send("this will never run");
//   } catch (e) {
//     res.status(500).json({
//       success: false,
//       message: e.message,
//     });
//   }
// });

// app.get('/async-error', async (req, res) => {
//    try {
//         await new Promise((resolve) => {
//             setTimeout(() => {
//                 console.log("hello")
//                 resolve()
//             }, 1000)
//         })

//         res.send("Finished after delay")

//    } catch (e) {
//         res.status(500).send(e.message)
//    }
// })