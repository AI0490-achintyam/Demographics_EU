const test = require("ava")
const sinon = require("sinon")
// const Joi = require("joi")
const {
  runRouteHandler, setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("../../../../_utils")
const { searchByName: get } = require("../../../../../routes/rest/SearchIdentifiers/index")
const region = require("../../../../../models/regions/index")

/** Setup & Teardown code (COMMON) */
test.before(setupMongo)
test.after.always(teardownMongo)
test.beforeEach(setupFixtures)
test.afterEach(teardownFixtures)
/* ******************************* */

test.beforeEach(async (t) => {
  // eslint-disable-next-line no-param-reassign
  t.context.query = {
    geographicLevel: "Zipcode",
    name: "indoor",
    page: 1,
    size: 10
  }
  // eslint-disable-next-line no-param-reassign
  t.context.invalidquery = {
  }
})

test.serial("regions.get: Verify response after entering valid data in geographicLevel and name", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: t.context.query
  })
  t.is(body.regions.length, 3)
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

test.serial("regions.get: Verify response after entering State in geographicLevel", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, geographicLevel: "State" }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("regions.get: Verify response after entering invalid parameter in geographicLevel", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, geographicLevel: "States" }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("regions.get: Verify response after entering County in geographicLevel", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, geographicLevel: "County" }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("regions.get: Verify response after entering Tract in geographicLevel", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, geographicLevel: "Tract" }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("regions.get: Verify response after entering Block Groups in geographicLevel", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, geographicLevel: "Block Group" }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("regions.get: Verify response after entering Block Groups with extra space between Block and Groups in geographicLevel", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, geographicLevel: "Block  Group" }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("regions.get: Verify response after entering Blocks in geographicLevel", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, geographicLevel: "Blocks" }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("regions.get: Verify response after entering Places in geographicLevel", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, geographicLevel: "Places" }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.skip("regions.get: Verify response after entering extra spaces before and after the Places in geographicLevel", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, geographicLevel: " Places " }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("regions.get: Verify response after entering MSA in geographicLevel", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, geographicLevel: "MSA" }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("regions.get: Verify response after entering MSA in lowercase in geographicLevel", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, geographicLevel: "mSA" }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("regions.get: Verify response after entering Zipcode in geographicLevel", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, geographicLevel: "Zipcode" }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("regions.get: Verify response after entering Zipcode in lowercase in geographicLevel", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, geographicLevel: "zipcode" }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("regions.get: Verify response after entering invalid string value in geographicLevel ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, geographicLevel: "x" }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("regions.get: Verify response after entering array value in geographicLevel ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, geographicLevel: ["Country"] }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("regions.get: Verify response after entering undefined value in geographicLevel ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, geographicLevel: undefined }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("regions.get: Verify response after entering null value in geographicLevel ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, geographicLevel: null }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("regions.get: Verify response after entering boolean value in geographicLevel ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, geographicLevel: true }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("regions.get: Verify response after entering integer value in name ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, name: 1 }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("regions.get: Verify response after entering array value in name ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, name: ["x"] }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("regions.get: Verify response after entering undefined value in name ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, name: undefined }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("regions.get: Verify response after entering null value in name ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, name: null }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("regions.get: Verify response after entering boolean value in name ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, name: true }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("regions.get: Verify response after entering value in name which is not in DB", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, name: "XYZ" }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("regions.get: Verify response after entering valid value in name, which is middle of the full name", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, name: "geolevel" }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("regions.get: Verify response after entering valid long text value in name", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, name: "Indoor stadium" }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("regions.get: Verify response after entering extra spaces before and after the name", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, name: " Indoor     stadium " }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("regions.get: Verify response after getting server error", async (t) => {
  const stub = sinon.stub(region, "find").throws(new Error("Server Error"))
  const { status, body } = await runRouteHandler(get, {
    query: t.context.query
  })
  t.is(status, 500)
  t.true(body.error)
  stub.restore()
})
