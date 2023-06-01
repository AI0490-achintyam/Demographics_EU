module.exports = function (msas) {
  // Write your custom logic and return a promise
  return msas.createIndex({ centroid: "2dsphere" }, { geometry: "2dsphere" })
}
