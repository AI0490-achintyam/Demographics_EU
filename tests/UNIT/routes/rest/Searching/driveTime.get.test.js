const test = require("ava")
const sinon = require("sinon")
// const Joi = require("joi")
const {
  runRouteHandler, setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("../../../../_utils")
const { get } = require("../../../../../routes/rest/users")
const Time = require("../../../../../models/user")

/** Setup & Teardown code (COMMON) */
test.before(setupMongo)
test.after.always(teardownMongo)
test.beforeEach(setupFixtures)
test.afterEach(teardownFixtures)
/* ******************************* */

test.beforeEach(async (t) => {
  // eslint-disable-next-line no-param-reassign
  t.context.query = {
    longitude: -84.091998,
    latitude: 30.455749,
    time: 10,
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

test.serial("drivetime.get: Verify response after entering valid data in longitude,latitude and time", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: t.context.query
  })
  // const { error } = responseSchema.validate(body.regions, { abortEarly: false })
  // t.true(error === undefined, error?.message)
  t.is(status, 200)
  t.false(body.error)
})

test.serial("drivetime.get: Verify response after entering invalid query", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: t.context.invalidquery
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("drivetime.get: Verify response after entering string value in longitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, longitude: "x" }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering array value in longitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, longitude: [-84.091998] }
  })
  t.is(status, 500)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering undefined value in longitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, longitude: undefined }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("drivetime.get: Verify response after entering null value in longitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, longitude: null }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("drivetime.get: Verify response after entering boolean value in longitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, longitude: true }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering string value in latitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, latitude: "x" }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering array value in latitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, latitude: [30.455749] }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering undefined value in latitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, latitude: undefined }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering null value in latitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, latitude: null }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("drivetime.get: Verify response after entering boolean value in latitude ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, latitude: true }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering negative value in time ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, time: -100 }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering string value in time ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, time: "x" }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering array value in time ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, time: [1000] }
  })
  t.is(status, 500)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after entering undefined value in time ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, time: undefined }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("drivetime.get: Verify response after entering null value in time ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, time: null }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("drivetime.get: Verify response after entering boolean value in time ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, time: true }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("drivetime.get: Verify response after getting server error", async (t) => {
  const stub = sinon.stub(Time, "find").throws(new Error("Server Error"))
  const { status, body } = await runRouteHandler(get, {
    query: t.context.query
  })
  t.is(status, 500)
  t.true(body.error)
  stub.restore()
})
