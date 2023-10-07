require("dotenv").config();
const express = require("express");
const app = express();
const _ = require("lodash");
const PORT = process.env.PORT || 3000;
const cors = require("cors");
app.use(cors());
const {
  fetchBlogData,
  calculateAnalytics,
  doFetching,
  getBlogData,
} = require("./middleware/middleware");
let Cache = getBlogData();

// for /api/blog-stats
app.get("/api/blog-stats", fetchBlogData, async (req, res) => {
  try {
    const analysisData = await calculateAnalytics();
    res.json(analysisData);
  } catch (error) {}
});

//for /api/blog-search
app.get("/api/blog-search", async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ error: "Query parameter is missing" });
  }
  if (!Cache) {
    await doFetching();
    Cache = getBlogData();
  }
  const blogData = Cache;
  // search
  const filteredBlogs = _.filter(blogData, (blog) => {
    return blog.title.toLowerCase().includes(query.toLowerCase());
  });
  if (filteredBlogs.length == 0) res.json("No such title Present.");
  else res.json(filteredBlogs);
});

// handling error
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
