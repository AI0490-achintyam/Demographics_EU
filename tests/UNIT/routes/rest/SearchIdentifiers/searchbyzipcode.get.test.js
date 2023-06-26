const test = require("ava")
const sinon = require("sinon")
// const Joi = require("joi")
const {
  runRouteHandler, setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("../../../../_utils")
const { searchByZipcode: get } = require("../../../../../routes/rest/SearchIdentifiers/index")
const zipcode = require("../../../../../models/regions/index")

/** Setup & Teardown code (COMMON) */
test.before(setupMongo)
test.after.always(teardownMongo)
test.beforeEach(setupFixtures)
test.afterEach(teardownFixtures)
/* ******************************* */

test.beforeEach(async (t) => {
  // eslint-disable-next-line no-param-reassign
  t.context.query = {
    zipcode: "indoor",
    page: 1,
    size: 10
  }
  // eslint-disable-next-line no-param-reassign
  t.context.invalidquery = {
  }
})

test.serial("regions.get: Verify response after entering valid data in zipcode", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: t.context.query
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("regions.get: Verify response after entering invalid query", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: t.context.invalidquery
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("regions.get: Verify response after entering integer value in zipcode ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, zipcode: 1 }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("regions.get: Verify response after entering array value in zipcode ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, zipcode: ["x"] }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("regions.get: Verify response after entering undefined value in zipcode ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, zipcode: undefined }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("regions.get: Verify response after entering null value in zipcode ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, zipcode: null }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("regions.get: Verify response after entering boolean value in zipcode ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, zipcode: true }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("regions.get: Verify response after entering value in zipcode which is not in DB", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, zipcode: "XYZ" }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("regions.get: Verify response after entering valid value in zipcode, which is middle of the full zipcode", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, zipcode: "geolevel" }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("regions.get: Verify response after entering valid long text value in zipcode", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, zipcode: "Indoor stadium" }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("regions.get: Verify response after entering extra spaces before and after the zipcode", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, zipcode: " Indoor     stadium " }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("regions.get: Verify response after getting server error", async (t) => {
  const stub = sinon.stub(zipcode, "find").throws(new Error("Server Error"))
  const { status, body } = await runRouteHandler(get, {
    query: t.context.query
  })
  t.is(status, 500)
  t.true(body.error)
  stub.restore()
})
