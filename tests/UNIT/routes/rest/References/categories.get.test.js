const test = require("ava")
const sinon = require("sinon")
// const Joi = require("joi")
const {
  runRouteHandler, setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("../../../../_utils")
const { categories: get } = require("../../../../../routes/rest/references/index")
const Categories = require("../../../../../models/reference")

/** Setup & Teardown code (COMMON) */
test.before(setupMongo)
test.after.always(teardownMongo)
test.beforeEach(setupFixtures)
test.afterEach(teardownFixtures)
/* ******************************* */

test.serial("category.get: Verify response after entering valid data in category ", async (t) => {
  const { status, body } = await runRouteHandler(get, {
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("category.get: Verify response after getting server error", async (t) => {
  const stub = sinon.stub(Categories, "distinct").throws(new Error("Server Error"))
  const { status, body } = await runRouteHandler(get, {
  })
  t.is(status, 500)
  t.true(body.error)
  stub.restore()
})
