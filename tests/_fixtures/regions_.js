module.exports = function (regions) {
  // Write your custom logic and return a promise
  // return regions.createIndexes([{ centroid: "2dsphere" }, { geometry: "2dsphere" }, { name: "text" }])
  return regions.createIndexes([
    { key: { name: "text" }, name: "text_index" },
    { key: { centroid: "2dsphere" }, name: "2dsphere_index" },
    { key: { geometry: "2dsphere" }, name: "2dsphere_index1" }
  ])
}
