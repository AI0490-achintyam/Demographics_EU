module.exports = function (regions) {
  // Write your custom logic and return a promise
  return regions.createIndex({ centroid: "2dsphere", geometry: "2dsphere" })
}

// module.exports = function (regions) {
//   // Write your custom logic and return a promise
//   return regions.createIndex({ name: "text" })
// }