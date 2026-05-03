const rss = require("@11ty/eleventy-plugin-rss");
const sitemap = require("eleventy-plugin-sitemap");
const CleanCSS = require("clean-css");
const Terser = require("terser");
const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {
  // Plugins
  eleventyConfig.addPlugin(rss);
  eleventyConfig.addPlugin(sitemap);

  // Pass-through files
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("_redirects");

  // Custom collections
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("posts/*.njk").reverse();
  });

  // Category pages: each tag gets a page
  eleventyConfig.addCollection("tagList", function(collectionApi) {
    const tagsSet = new Set();
    collectionApi.getAll().forEach(item => {
      if (item.data.tags) {
        item.data.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return [...tagsSet].sort();
  });

  // Category data from _data/categories.json is merged automatically

  // Markdown parser
  let md = new markdownIt({ html: true });
  eleventyConfig.setLibrary("md", md);

  // CSS minification filter
  eleventyConfig.addFilter("cssmin", function(code) {
    return new CleanCSS({}).minify(code).styles;
  });

  // JS minification filter (inline scripts)
  eleventyConfig.addAsyncFilter("jsmin", async function(code) {
    const result = await Terser.minify(code);
    return result.code || code;
  });

  // Date filters
  eleventyConfig.addFilter("dateToRfc822", rss.dateToRfc822);
  eleventyConfig.addFilter("dateToISO", (date) => new Date(date).toISOString());
  eleventyConfig.addFilter("dateFormat", (date) => {
    // simple date format for display
    return new Date(date).toLocaleDateString("ur-PK", { year:"numeric", month:"long", day:"numeric" });
  });

  // Pagination helpers
  eleventyConfig.addFilter("slice", (arr, start, end) => arr.slice(start, end));

  return {
    dir: {
      input: ".",
      output: "_site"
    }
  };
};
