const test = require("ava")
// const multer = require("multer")
// const FormData = require("form-data")
const sinon = require("sinon")

// const Joi = require("joi")
const {
  runRouteHandler, setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("../../../../_utils")
const { byShapeFile: get } = require("../../../../../routes/rest/DemographicsData/index")
const shapeFile = require("../../../../../models/regions/index")

/** Setup & Teardown code (COMMON) */
test.before(setupMongo)
test.after.always(teardownMongo)
test.beforeEach(setupFixtures)
test.afterEach(teardownFixtures)
/* ******************************* */

test.beforeEach(async () => {
  process.env.SHAPE_RESTORE_SHX = "YES"
})

test.afterEach(async () => {
  delete process.env.SHAPE_RESTORE_SHX
})

test.skip("shapefile.get: Verify response after entering valid file", async (t) => {
//   const form = new FormData()
//   form.append("file", "./testfile.shp")
  const { status, body } = await runRouteHandler(get, {
    file: {
      fieldname: "file",
      originalname: "user.shp",
      encoding: "7bit",
      mimetype: "application/octet-stream",
      destination: "public/files",
      filename: "testfile.shp",
      path: "./testfile.shp",
      size: 17223
    }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("shapefile.get: Verify response after entering invalid file", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    file: {
      fieldname: "file",
      originalname: "user.js",
      encoding: "7bit",
      mimetype: "application/octet-stream",
      destination: "public/files",
      filename: "testfile.shp",
      path: "./testfile.shp",
      size: 17223
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("shapefile.get: Verify response after getting server error", async (t) => {
  const stub = sinon.stub(shapeFile, "find").throws(new Error("Server Error"))
  const { status, body } = await runRouteHandler(get, {
    file: {
      fieldname: "file",
      originalname: "user.shp",
      encoding: "7bit",
      mimetype: "application/octet-stream",
      destination: "public/files",
      filename: "testfile.shp",
      path: "./testfile.shp",
      size: 17223
    }
  })
  t.is(status, 500)
  t.true(body.error)
  stub.restore()
})
