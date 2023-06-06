const test = require("ava")
const sinon = require("sinon")
// const Joi = require("joi")
const {
  runRouteHandler, setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("../../../../_utils")
const { radiusSearch: get } = require("../../../../../routes/rest/searching/index")
const Radius = require("../../../../../models/regions/index")

/** Setup & Teardown code (COMMON) */
test.before(setupMongo)
test.after.always(teardownMongo)
test.beforeEach(setupFixtures)
test.afterEach(teardownFixtures)
/* ******************************* */

test.beforeEach(async (t) => {
  // eslint-disable-next-line no-param-reassign
  t.context.query = {
    long: -84.091998,
    lat: 30.455749,
    rad: 1,
  }
  // eslint-disable-next-line no-param-reassign
  t.context.invalidquery = {
  }
})

// const responseSchema = Joi.array().items(Joi.object().keys({
//   isActiveStatus: Joi.boolean(),
//   _updatedBy: [Joi.string(), Joi.allow(null)],
//   _id: Joi.string(),
//   longitude: Joi.string(),
//   latitude: Joi.string(),
//   _createdBy: Joi.string(),
//   id: Joi.string()
// }))

test.serial("radius.get: Verify response after entering valid data in longitude,latitude and radius", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: t.context.query
  })
  // const { error } = responseSchema.validate(body.regions, { abortEarly: false })
  // t.true(error === undefined, error?.message)
  t.is(status, 200)
  t.false(body.error)
})

test.serial("radius.get: Verify response after entering invalid query", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: t.context.invalidquery
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("radius.get: Verify response after entering string value in longitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, long: "x" }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("radius.get: Verify response after entering array value in longitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, long: [-84.091998, -84.091999] }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("radius.get: Verify response after entering undefined value in longitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, long: undefined }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("radius.get: Verify response after entering null value in longitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, long: null }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("radius.get: Verify response after entering boolean value in longitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, long: true }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("radius.get: Verify response after entering string value in latitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, lat: "x" }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("radius.get: Verify response after entering array value in latitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, lat: [30.455749, 30.455749] }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("radius.get: Verify response after entering undefined value in latitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, lat: undefined }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("radius.get: Verify response after entering null value in latitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, lat: null }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("radius.get: Verify response after entering boolean value in latitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, lat: true }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("radius.get: Verify response after entering negative value in radius ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, rad: -100 }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("radius.get: Verify response after entering string value in radius ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, rad: "x" }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("radius.get: Verify response after entering array value in radius ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, rad: ["x"] }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("radius.get: Verify response after entering undefined value in radius ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, rad: undefined }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("radius.get: Verify response after entering null value in radius ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, rad: null }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("radius.get: Verify response after entering boolean value in radius ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, rad: true }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("radius.get: Verify response after getting server error", async (t) => {
  const stub = sinon.stub(Radius, "find").throws(new Error("Server Error"))
  const { status, body } = await runRouteHandler(get, {
    query: t.context.query
  })
  t.is(status, 500)
  t.true(body.error)
  stub.restore()
})
