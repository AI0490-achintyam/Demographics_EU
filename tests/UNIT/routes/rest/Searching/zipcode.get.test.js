const test = require("ava")
const sinon = require("sinon")
// const Joi = require("joi")
const {
  runRouteHandler, setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("../../../../_utils")
const { get } = require("../../../../../routes/rest/users")
const zipcode = require("../../../../../models/user")

/** Setup & Teardown code (COMMON) */
test.before(setupMongo)
test.after.always(teardownMongo)
test.beforeEach(setupFixtures)
test.afterEach(teardownFixtures)
/* ******************************* */

test.beforeEach(async (t) => {
  // eslint-disable-next-line no-param-reassign
  t.context.query = {
    zipcode: "711101"
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

test.serial("zipcode.get: Verify response after entering valid data in zipcode ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: t.context.query
  })
  // const { error } = responseSchema.validate(body.regions, { abortEarly: false })
  // t.true(error === undefined, error?.message)
  t.is(status, 200)
  t.false(body.error)
})

test.serial("zipcode.get: Verify response after entering invalid query", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: t.context.invalidquery
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("zipcode.get: Verify response after entering integer value in zipcode ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, zipcode: 100 }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("zipcode.get: Verify response after entering invalid string value in zipcode ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, zipcode: "x" }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("zipcode.get: Verify response after entering array value in zipcode ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, zipcode: ["711101"] }
  })
  t.is(status, 500)
  t.true(body.error)
})

test.serial("zipcode.get: Verify response after entering undefined value in zipcode ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, zipcode: undefined }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("zipcode.get: Verify response after entering null value in zipcode ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, zipcode: null }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("zipcode.get: Verify response after entering boolean value in zipcode ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, zipcode: true }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("zipcode.get: Verify response after getting server error", async (t) => {
  const stub = sinon.stub(zipcode, "find").throws(new Error("Server Error"))
  const { status, body } = await runRouteHandler(get, {
    query: t.context.query
  })
  t.is(status, 500)
  t.true(body.error)
  stub.restore()
})
