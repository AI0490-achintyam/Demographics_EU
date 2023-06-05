const test = require("ava")
const sinon = require("sinon")
// const Joi = require("joi")
const {
  runRouteHandler, setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("../../../../_utils")
const { get } = require("../../../../../routes/rest/users")
const User = require("../../../../../models/user")

/** Setup & Teardown code (COMMON) */
test.before(setupMongo)
test.after.always(teardownMongo)
test.beforeEach(setupFixtures)
test.afterEach(teardownFixtures)
/* ******************************* */

test.beforeEach(async (t) => {
  // eslint-disable-next-line no-param-reassign
  t.context.validuserDataId = "64645fc10adf19295e261088"
  // eslint-disable-next-line no-param-reassign
  t.context.softdeleteduserDataId = "646460100adf19295e26108a"
  // eslint-disable-next-line no-param-reassign
  t.context.invaliduserDataId = "6465f5a5d3ca963534ce7d6e"
  // eslint-disable-next-line no-param-reassign
  t.context.invalidformatteduserDataId = "63d9053660sdhjs"
})

// const responseSchema = Joi.object().keys({
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
// })

test.serial("User.get: Verify response after entering valid user id", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      id: t.context.validuserDataId
    }
  })
  // const { error } = responseSchema.validate(body.user, { abortEarly: false })
  // t.true(error === undefined, error?.message)
  t.is(body.user._id, t.context.validuserDataId)
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.get: Verify response after entering soft-deleted user id", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      id: t.context.softdeleteduserDataId
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.get: Verify response after entering invalid user id", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      id: t.context.invaliduserDataId
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.get: Verify response after entering invalid formatted user id", async (t) => {
  const { status, body } = await runRouteHandler(get, {
    params: {
      id: t.context.invalidformatteduserDataId
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.get: Verify response after getting server error", async (t) => {
  const stub = sinon.stub(User, "findOne").throws(new Error("Server Error"))
  const { status, body } = await runRouteHandler(get, {
    params: {
      id: t.context.validuserDataId
    }
  })
  t.is(status, 500)
  t.true(body.error)
  stub.restore()
})
