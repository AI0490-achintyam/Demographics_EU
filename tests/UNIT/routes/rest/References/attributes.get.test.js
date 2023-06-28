const test = require("ava")
const sinon = require("sinon")
// const Joi = require("joi")
const {
  runRouteHandler, setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("../../../../_utils")
const { attributes: get } = require("../../../../../routes/rest/references/index")
const Attributes = require("../../../../../models/reference")

/** Setup & Teardown code (COMMON) */
test.before(setupMongo)
test.after.always(teardownMongo)
test.beforeEach(setupFixtures)
test.afterEach(teardownFixtures)
/* ******************************* */

test.beforeEach(async (t) => {
  // eslint-disable-next-line no-param-reassign
  t.context.query = {
    page: 1,
    size: 10
  }
  // eslint-disable-next-line no-param-reassign
  t.context.emptyquery = {
  }
})

test.serial("attributes.get: Verify response after entering valid data", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: t.context.query
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("attributes.get: Verify response after entering empty query", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: t.context.emptyquery
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("attributes.get: Verify response after entering valid string value in category ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, category: "Race" }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.skip("attributes.get: Verify response after entering array value in category ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, category: ["Race"] }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("attributes.get: Verify response after entering undefined value in category ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, category: undefined }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("attributes.get: Verify response after entering null value in category ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, category: null }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.skip("attributes.get: Verify response after entering boolean value in category ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, category: true }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("attributes.get: Verify response after getting server error", async (t) => {
  const stub = sinon.stub(Attributes, "paginate").throws(new Error("Server Error"))
  const { status, body } = await runRouteHandler(get, {
    query: t.context.query
  })
  t.is(status, 500)
  t.true(body.error)
  stub.restore()
})
