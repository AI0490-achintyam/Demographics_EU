module.exports = function (census) {
  // Write your custom logic and return a promise
  return census.createIndexes([
    { key: { geoId: 1 }, name: "text_index" }
  ])
}
