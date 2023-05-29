const test = require("ava")
const sinon = require("sinon")
// const Joi = require("joi")
const {
  runRouteHandler, setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("../../../../_utils")
const { get } = require("../../../../../routes/rest/users")
const Region = require("../../../../../models/user")

/** Setup & Teardown code (COMMON) */
test.before(setupMongo)
test.after.always(teardownMongo)
test.beforeEach(setupFixtures)
test.afterEach(teardownFixtures)
/* ******************************* */

test.beforeEach(async (t) => {
  // eslint-disable-next-line no-param-reassign
  t.context.validRegionId = "646706e194140e5d04fdba4b"
  // eslint-disable-next-line no-param-reassign
  t.context.invalidRegionId = "64747ecfa1da2786a41ffeff"
  // eslint-disable-next-line no-param-reassign
  t.context.invalidformattedRegionId = "63fd90058easdhj"
})

test.serial("Region.get: Verify response after entering valid Region id", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      id: t.context.validRegionId,
    }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("Region.get: Verify response after entering invalid Region id", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      id: t.context.invalidRegionId
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Region.get: Verify response after entering invalid formatted Region id", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      id: t.context.invalidformattedRegionId
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Region.get: Verify response after getting server error", async (t) => {
  const stub = sinon.stub(Region, "findOne").throws(new Error("Server Error"))
  const { status, body } = await runRouteHandler(get, {
    params: {
      id: t.context.validRegionId,
    }
  })
  t.is(status, 500)
  t.true(body.error)
  stub.restore()
})
