const test = require("ava")
const sinon = require("sinon")
const {
  runRouteHandler, setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("../../../../_utils")
const { delete: del } = require("../../../../../routes/rest/users")
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
  t.context.invaliduserDataId = "6465f5a5d3ca963534ce7d6e"
  // eslint-disable-next-line no-param-reassign
  t.context.invalidformatteduserDataId = "63d9053660sdhjs"
  // eslint-disable-next-line no-param-reassign
  t.context.authId = {
    _id: "64645fc10adf19295e261088"
  }
})

test.serial("User.delete: Verify response after entering valid user id", async (t) => {
  const { status, body } = await runRouteHandler(del, {
    method: "DELETE",
    params: {
      id: t.context.validuserDataId
    },
    auth: t.context.authId
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.delete: Verify response after entering invalid formatted user id", async (t) => {
  const { status, body } = await runRouteHandler(del, {
    method: "DELETE",
    params: {
      id: t.context.invalidformatteduserDataId
    },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.delete: Verify response after entering invalid user id", async (t) => {
  const { status, body } = await runRouteHandler(del, {
    method: "DELETE",
    params: {
      id: t.context.invaliduserDataId
    },
    auth: t.context.authId
  })
  t.is(status, 200)
  t.false(body.error)
})

// test.serial("User.delete: Verify response after getting server error", async (t) => {
//   const stub = sinon.stub(User, "updateOne").throws(new Error("Server Error"))
//   const { status, body } = await runRouteHandler(del, {
//     method: "DELETE",
//     params: {
//       id: t.context.validuserDataId
//     },
//     auth: t.context.authId
//   })
//   t.is(status, 500)
//   t.true(body.error)
//   stub.restore()
// })
