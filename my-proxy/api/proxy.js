const fetch = require("node-fetch");

module.exports = async (req, res) => {
  const { query, variables } = req.body;

  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const data = await response.json();
  res.status(response.status).json(data);
};