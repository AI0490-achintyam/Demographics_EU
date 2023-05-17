const test = require("ava")
const Joi = require("joi")
// const jwt = require("jsonwebtoken")
const {
  runRouteHandler, setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("../../../../_utils")
const { post } = require("../../../../../routes/rest/auth/index")

/** Setup & Teardown code (COMMON) */
test.before(setupMongo)
test.after.always(teardownMongo)
test.beforeEach(setupFixtures)
test.afterEach(teardownFixtures)
/* ******************************* */

test.beforeEach(async (t) => {
  process.env.SECRET = "abcd1234"
  // eslint-disable-next-line no-param-reassign
  t.context.invalidreqbody = {
    handle: "test",
    password: "test"
  }
  // eslint-disable-next-line no-param-reassign
  t.context.validreqbody = {
    handle: "rohit",
    password: "qwerty"
  }
  // eslint-disable-next-line no-param-reassign
  t.context.undefinedreqbody = {
  }
  // eslint-disable-next-line no-param-reassign
  t.context.inactivereqbody = {
    handle: "rahul",
    password: "qwerty"
  }
  // eslint-disable-next-line no-param-reassign
  t.context.softdeletedreqbody = {
    handle: "Raj",
    password: "qwerty"
  }
})

// const responseSchema = Joi.object().keys({
//   error: Joi.boolean(),
//   handle: Joi.string(),
//   token: Joi.string()
// })

// const decodePayloadSchema = Joi.object().keys({
//   id: Joi.string(),
//   _id: Joi.string(),
//   fullName: Joi.string(),
//   userName: Joi.string(),
//   email: Joi.string(),
//   allowedVerticals: Joi.array(),
//   isSuperAdmin: Joi.boolean(),
//   iat: Joi.number(),
//   exp: Joi.number()
// })

test.afterEach(async () => {
  delete process.env.SECRET
})

test.serial("Auth.post: Verify response after entering valid credentials", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: t.context.validreqbody
  })
  // const { error: respErr } = responseSchema.validate(body, { abortEarly: false })
  // t.true(respErr === undefined, respErr?.message)
  //   const { token } = body
  //   const secret = process.env.SECRET
  //   const decoded = jwt.verify(token, secret)
  //   const { error: payloadErr } = decodePayloadSchema.validate(decoded, { abortEarly: false })
  //   t.true(payloadErr === undefined, payloadErr?.message)
  //   t.is(decoded.userName, t.context.validreqbody.handle)
  t.is(status, 200)
  t.false(body.error)
})

test.serial("Auth.post: Verify response after entering invalid username", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.validreqbody, handle: "Ro" }
  })
  t.is(status, 500)
  t.true(body.error)
})

test.serial("Auth.post: Verify response after entering invalid password", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.validreqbody, password: "xyz" }
  })
  t.is(status, 500)
  t.true(body.error)
})

test.serial("Auth.post: Verify response after entering integer value in username", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.validreqbody, handle: 1 }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Auth.post: Verify response after entering undefined value in username", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.validreqbody, handle: undefined }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Auth.post: Verify response after entering null value in username", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.validreqbody, handle: null }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Auth.post: Verify response after entering array value in username", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.validreqbody, handle: ["rohit"] }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Auth.post: Verify response after entering boolean value in username", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.validreqbody, handle: true }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Auth.post: Verify response after entering integer value in password", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.validreqbody, password: 1 }
  })
  t.is(status, 500)
  t.true(body.error)
})

test.serial("Auth.post: Verify response after entering undefined value in password", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.validreqbody, password: undefined }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Auth.post: Verify response after entering null value in password", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.validreqbody, password: null }
  })
  t.is(status, 500)
  t.true(body.error)
})

test.serial("Auth.post: Verify response after entering array value in password", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.validreqbody, password: ["qwerty"] }
  })
  t.is(status, 500)
  t.true(body.error)
})

test.serial("Auth.post: Verify response after entering boolean value in password", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.validreqbody, password: true }
  })
  t.is(status, 500)
  t.true(body.error)
})

test.serial("Auth.post: Checking if softdeleted user is able to login or not", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: t.context.softdeletedreqbody
  })
  t.is(status, 500)
  t.true(body.error)
})

test.serial("Auth.post: Verify response for undefined values", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: t.context.undefinedreqbody
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Auth.post: Verify response after entering inactive user credentials", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: t.context.inactivereqbody
  })
  t.is(status, 500)
  t.true(body.error)
})

test.serial("Auth.post: Verify response after entering invalid credentials", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: t.context.invalidreqbody
  })
  t.is(status, 500)
  t.true(body.error)
})
