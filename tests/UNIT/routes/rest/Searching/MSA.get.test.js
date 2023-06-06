const test = require("ava")
const sinon = require("sinon")
// const Joi = require("joi")
const {
  runRouteHandler, setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("../../../../_utils")
const { msa: get } = require("../../../../../routes/rest/searching/index")
const geoId = require("../../../../../models/regions/index")

/** Setup & Teardown code (COMMON) */
test.before(setupMongo)
test.after.always(teardownMongo)
test.beforeEach(setupFixtures)
test.afterEach(teardownFixtures)
/* ******************************* */

test.beforeEach(async (t) => {
  // eslint-disable-next-line no-param-reassign
  t.context.validgeoId = "60650408211"
  // eslint-disable-next-line no-param-reassign
  t.context.invalidgeoId = "234324"
})

test.serial("msa.get: Verify response after entering valid data in geoId ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: t.context.validgeoId
    }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("msa.get: Verify response after entering invalid query", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: t.context.invalidgeoId
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("msa.get: Verify response after entering integer value in geoId ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: 100
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("msa.get: Verify response after entering invalid string value in geoId ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: 100
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("msa.get: Verify response after entering array value in geoId ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: [100]
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("msa.get: Verify response after entering undefined value in geoId ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: undefined
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("msa.get: Verify response after entering null value in geoId ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: null
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("msa.get: Verify response after entering boolean value in geoId ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: true
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("msa.get: Verify response after getting server error", async (t) => {
  const stub = sinon.stub(geoId, "find").throws(new Error("Server Error"))
  const { status, body } = await runRouteHandler(get, {
    params: {
      geoId: t.context.validgeoId
    }
  })
  t.is(status, 500)
  t.true(body.error)
  stub.restore()
})
