const test = require("ava")
const sinon = require("sinon")
// const Joi = require("joi")
const {
  runRouteHandler, setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("../../../../_utils")
const { find } = require("../../../../../routes/rest/users")
const User = require("../../../../../models/user")

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
    searchParam: null,
    active: false
  }
  // eslint-disable-next-line no-param-reassign
  t.context.invalidquery = {
  }
  // eslint-disable-next-line no-param-reassign
  t.context.displayitems = 2
})

// const responseSchema = Joi.array().items(Joi.object().keys({
//   name: Joi.object(),
//   _id: Joi.string(),
//   userName: Joi.string(),
//   email: Joi.string(),
//   phoneNumber: Joi.string(),
//   isActiveStatus: Joi.boolean(),
//   _createdBy: Joi.string(),
//   _updatedBy: [Joi.string(), Joi.allow(null)],
//   createdAt: Joi.string(),
//   updatedAt: Joi.string(),
//   id: Joi.string()
// }))

test.serial("User.find: Verify response after entering valid data in page,size", async (t) => {
  const { status, body } = await runRouteHandler(find, {
    query: t.context.query
  })
  // const { error } = responseSchema.validate(body.users, { abortEarly: false })
  // t.true(error === undefined, error?.message)
  t.is(body.users.length, t.context.displayitems)
  t.is(body.page, t.context.query.page)
  t.is(body.size, t.context.query.size)
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.find: Verify response after entering invalid query", async (t) => {
  const { status, body } = await runRouteHandler(find, {
    query: t.context.invalidquery
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.find: Verify response after entering string value in page", async (t) => {
  const { status, body } = await runRouteHandler(find, {
    query: { ...t.context.query, page: "x" }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.find: Verify response after entering string value in size", async (t) => {
  const { status, body } = await runRouteHandler(find, {
    query: { ...t.context.query, size: "x" }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.find: Verify response after entering true value in active", async (t) => {
  const { status, body } = await runRouteHandler(find, {
    query: { ...t.context.query, active: "true" }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.find: Verify response after entering string value in active", async (t) => {
  const { status, body } = await runRouteHandler(find, {
    query: { ...t.context.query, active: "x" }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.find: Verify response after entering integer value in active", async (t) => {
  const { status, body } = await runRouteHandler(find, {
    query: { ...t.context.query, active: 1 }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.find: Verify response after entering array value in active", async (t) => {
  const { status, body } = await runRouteHandler(find, {
    query: { ...t.context.query, active: [true] }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.find: Verify response after entering integer value in searchParam", async (t) => {
  const { status, body } = await runRouteHandler(find, {
    query: { ...t.context.query, searchParam: 1 }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.find: Verify response after entering string value in searchParam", async (t) => {
  const { status, body } = await runRouteHandler(find, {
    query: { ...t.context.query, searchParam: "x" }
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.find: Verify response after entering srray value in searchParam", async (t) => {
  const { status, body } = await runRouteHandler(find, {
    query: { ...t.context.query, searchParam: ["x"] }
  })
  t.is(status, 500)
  t.true(body.error)
})

test.serial("User.find: Verify response after entering boolean value in searchParam", async (t) => {
  const { status, body } = await runRouteHandler(find, {
    query: { ...t.context.query, searchParam: true }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.find: Verify response after getting server error", async (t) => {
  const stub = sinon.stub(User, "find").throws(new Error("Server Error"))
  const { status, body } = await runRouteHandler(find, {
    query: t.context.query
  })
  t.is(status, 500)
  t.true(body.error)
  stub.restore()
})
