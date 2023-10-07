const axios = require("axios");
const _ = require("lodash");

let Cache = null;

// fetching data
const doFetching = async () => {
  const url = process.env.URL;
  const Api_key = process.env.API_KEY;
  const response = await axios.get(`${url}`, {
    headers: {
      "x-hasura-admin-secret": `${Api_key}`,
    },
  });
  Cache = response.data["blogs"];
  // console.log(Cache);
};

const fetchBlogData = async (req, res, next) => {
  try {
    if (!Cache) {
      await doFetching();
    }
    next();
  } catch (error) {
    console.error("Error fetching blog data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const calculateAnalytics = _.memoize(
  async (req, res, next) => {
    try {
      const blogData = Cache;
      const totalBlogs = blogData.length;
      const blogWithLongestTitle = _.maxBy(
        blogData,
        (blog) => blog.title.length
      );
      const blogsWithPrivacyTitle = _.filter(blogData, (blog) => {
        return blog.title.toLowerCase().includes("privacy");
      }).length;
      const uniqueBlogTitles = _.uniqBy(blogData, "title").map(
        (blog) => blog.title
      );

      const analyticsData = {
        totalBlogs,
        blogWithLongestTitle: blogWithLongestTitle.title,
        blogsWithPrivacyTitle,
        uniqueBlogTitles,
      };

      return analyticsData;
    } catch (error) {
      console.error("Error calculating analytics:", error.message);
      throw error;
    }
  },
  () => `${process.env.CACHE_KEY}`,
  60 * 60 * 1000 //1hr
);

module.exports = {
  fetchBlogData,
  calculateAnalytics,
  doFetching,
  getBlogData: () => Cache,
};
