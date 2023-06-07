const test = require("ava")
const sinon = require("sinon")
// const Joi = require("joi")
const {
  runRouteHandler, setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("../../../../_utils")
const { regions: get } = require("../../../../../routes/rest/searching/index")
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
    term: "Indoor",
    page: 1,
    size: 10
  }
  // eslint-disable-next-line no-param-reassign
  t.context.invalidquery = {
  }
})

test.only("regions.get: Verify response after entering valid data in geographicLevel and term", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: t.context.query
  })
  console.log(body)
  t.is(status, 200)
  t.false(body.error)
})

test.serial("regions.get: Verify response after entering invalid query", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: t.context.invalidquery
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("regions.get: Verify response after entering State in geographicLevel", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, geographicLevel: "State" }
  })
  t.is(status, 200)
  t.false(body.error)
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
    query: { ...t.context.query, geographicLevel: "Block Groups" }
  })
  t.is(status, 200)
  t.false(body.error)
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

test.serial("regions.get: Verify response after entering MSA in geographicLevel", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, geographicLevel: "MSA" }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("regions.get: Verify response after entering Zipcode in geographicLevel", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, geographicLevel: "Zipcode" }
  })
  t.is(status, 200)
  t.false(body.error)
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
  t.is(status, 500)
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
  t.is(status, 200)
  t.false(body.error)
})

test.serial("regions.get: Verify response after entering boolean value in geographicLevel ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, geographicLevel: true }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("regions.get: Verify response after entering integer value in term ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, term: 1 }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("regions.get: Verify response after entering array value in term ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, term: ["x"] }
  })
  t.is(status, 500)
  t.true(body.error)
})

test.serial("regions.get: Verify response after entering undefined value in term ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, term: undefined }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("regions.get: Verify response after entering null value in term ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, term: null }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("regions.get: Verify response after entering boolean value in term ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, term: true }
  })
  t.is(status, 400)
  t.true(body.error)
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
