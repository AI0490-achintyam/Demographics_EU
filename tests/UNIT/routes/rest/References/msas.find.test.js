const test = require("ava")
const sinon = require("sinon")
// const Joi = require("joi")
const {
  runRouteHandler, setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("../../../../_utils")
const { get } = require("../../../../../routes/rest/users")
const MSA = require("../../../../../models/user")

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
    size: 2,
  }
  // eslint-disable-next-line no-param-reassign
  t.context.invalidquery = {
  }
  // eslint-disable-next-line no-param-reassign
  t.context.displayitems = 2
})

// const responseSchema = Joi.array().items(Joi.object().keys({
//   isActiveStatus: Joi.boolean(),
//   _updatedBy: [Joi.string(), Joi.allow(null)],
//   _id: Joi.string(),
//   sourceName: Joi.string(),
//   displayName: Joi.string(),
//   code: Joi.number(),
//   _createdBy: Joi.string(),
//   id: Joi.string()
// }))

test.serial("MSA.get: Verify response after entering valid data in page,size ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: t.context.query
  })
  //   const { error } = responseSchema.validate(body.MSAs, { abortEarly: false })
  //   t.true(error === undefined, error?.message)
  //   t.is(body.MSAs.length, t.context.displayitems)
  //   t.is(body.page, t.context.query.page)
  //   t.is(body.size, t.context.query.size)
  t.is(status, 200)
  t.false(body.error)
})

test.serial("MSA.get: Verify response after entering invalid query", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: t.context.invalidquery
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("MSA.get: Verify response after entering string value in page ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, page: "x" }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("MSA.get: Verify response after entering string value in size ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    query: { ...t.context.query, size: "x" }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("MSA.get: Verify response after getting server error", async (t) => {
  const stub = sinon.stub(MSA, "find").throws(new Error("Server Error"))
  const { status, body } = await runRouteHandler(get, {
    query: t.context.query
  })
  t.is(status, 500)
  t.true(body.error)
  stub.restore()
})

test.serial("MSA.get: Verify response after getting empty returns", async (t) => {
  const stub = sinon.stub(MSA, "find").returns([])
  const { status, body } = await runRouteHandler(get, {
    query: t.context.query
  })
  t.is(status, 200)
  t.false(body.error)
  stub.restore()
})
