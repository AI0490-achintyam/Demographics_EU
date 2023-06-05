const test = require("ava")
const sinon = require("sinon")
// const Joi = require("joi")
const {
  runRouteHandler, setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("../../../../_utils")
const { get } = require("../../../../../routes/rest/users")
const term = require("../../../../../models/user")

/** Setup & Teardown code (COMMON) */
test.before(setupMongo)
test.after.always(teardownMongo)
test.beforeEach(setupFixtures)
test.afterEach(teardownFixtures)
/* ******************************* */

test.beforeEach(async (t) => {
  // eslint-disable-next-line no-param-reassign
  t.context.query = {
    term: "India",
  }
  // eslint-disable-next-line no-param-reassign
  t.context.invalidquery = {
  }
})

// const responseSchema = Joi.array().items(Joi.object().keys({
//   isActiveStatus: Joi.boolean(),
//   _updatedBy: [Joi.string(), Joi.allow(null)],
//   _id: Joi.string(),
//   geographicLevel: Joi.string(),
//   latitude: Joi.string(),
//   _createdBy: Joi.string(),
//   id: Joi.string()
// }))

test.serial("references.get: Verify response after entering valid data in term", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: t.context.query
  })
  // const { error } = responseSchema.validate(body.regions, { abortEarly: false })
  // t.true(error === undefined, error?.message)
  t.is(status, 200)
  t.false(body.error)
})

test.serial("references.get: Verify response after entering invalid query", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: t.context.invalidquery
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("references.get: Verify response after entering integer value in term ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, term: 1 }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("references.get: Verify response after entering array value in term ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, term: ["x"] }
  })
  t.is(status, 500)
  t.true(body.error)
})

test.serial("references.get: Verify response after entering undefined value in term ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, term: undefined }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("references.get: Verify response after entering null value in term ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, term: null }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("references.get: Verify response after entering boolean value in term ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, term: true }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("references.get: Verify response after getting server error", async (t) => {
  const stub = sinon.stub(term, "find").throws(new Error("Server Error"))
  const { status, body } = await runRouteHandler(get, {
    query: t.context.query
  })
  t.is(status, 500)
  t.true(body.error)
  stub.restore()
})
