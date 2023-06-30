const test = require("ava")
const sinon = require("sinon")
const {
  runRouteHandler, setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("../../../../_utils")
const { post } = require("../../../../../routes/rest/auth/signup")
const Signup = require("../../../../../models/user")

/** Setup & Teardown code (COMMON) */
test.before(setupMongo)
test.after.always(teardownMongo)
test.beforeEach(setupFixtures)
test.afterEach(teardownFixtures)
/* ******************************* */

test.beforeEach(async (t) => {
  // eslint-disable-next-line no-param-reassign
  t.context.reqbody = {
    email: "rohittest1@test.com",
    phone: "7980792906",
    name: {
      first: "rohit",
      last: "test"
    },
    password: "rohit"
  }
  // eslint-disable-next-line no-param-reassign
  t.context.undefinedreqbody = {
  }
})

test.serial("Signup.post: Verify response after entering valid input", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: t.context.reqbody
  })
  t.is(status, 200)
  t.false(body.error)
})

test.skip("Signup.post: Verify response after entering invalid formatted email", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, email: "ro" }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.skip("Signup.post: Verify response after entering integer email", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, email: 1 }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.skip("Signup.post: Verify response after entering  array value in email", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, email: ["rohittest1@test.com"] }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Signup.post: Verify response after entering undefined value in email", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, email: undefined }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.skip("Signup.post: Verify response after entering null value in email", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, email: null }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.skip("Signup.post: Verify response after entering boolean value in email", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, email: true }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Signup.post: Verify response after entering valid email but it already exist", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, email: "rishi@test.com" }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.skip("Signup.post: Verify response after entering integer phone", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, phone: 1 }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.skip("Signup.post: Verify response after entering  array value in phone", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, phone: ["7980792906"] }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.skip("Signup.post: Verify response after entering undefined value in phone", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, phone: undefined }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.skip("Signup.post: Verify response after entering null value in phone", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, phone: null }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.skip("Signup.post: Verify response after entering boolean value in phone", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, phone: true }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Signup.post: Verify response after entering integer value in password", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, password: 1 }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Signup.post: Verify response after entering integer value in firstname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: 1,
        last: "Charan"
      }
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Signup.post: Verify response after entering blank value in firstname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: " ",
        last: "Charan"
      }
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Signup.post: Verify response after entering array value in firstname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: ["Ram"],
        last: "Charan"
      }
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.skip("Signup.post: Verify response after entering extra spaces before and after the firstname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: "  Ram  ",
        last: "Charan"
      }
    }
  })
  const newfirstname = "Ram"
  t.is(body.user.name.first, newfirstname)
  t.is(status, 200)
  t.false(body.error)
})

test.serial("Signup.post: Verify response after entering undefined value in firstname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: undefined,
        last: "Charan"
      }
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Signup.post: Verify response after entering null value in firstname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: null,
        last: "Charan"
      }
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Signup.post: Verify response after entering boolean value in firstname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: true,
        last: "Charan"
      }
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.skip("Signup.post: Verify response after entering extra spaces before and after the lastname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: "Ram",
        last: "  Charan  "
      }
    }
  })
  const newlasname = "Charan"
  t.is(body.user.name.last, newlasname)
  t.is(status, 200)
  t.false(body.error)
})

test.serial("Signup.post: Verify response after entering integer value in lastname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: "Ram",
        last: 1
      }
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Signup.post: Verify response after entering blank value in lastname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: "Ram",
        last: " "
      }
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Signup.post: Verify response after entering array value in lastname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: "Ram",
        last: ["Charan"]
      }
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Signup.post: Verify response after entering undefined value in lastname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: "Ram",
        last: undefined
      }
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Signup.post: Verify response after entering null value in lastname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: "Ram",
        last: null
      }
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Signup.post: Verify response after entering boolean value in lastname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: "Ram",
        last: true
      }
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Signup.post: Verify response after entering undefined value in name", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: undefined
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Signup.post: Verify response after entering null value in name", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: null
    }
  })
  t.is(status, 500)
  t.true(body.error)
})

test.serial("Signup.post: Verify response after entering boolean value in name", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: true
    }
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Signup.post: Verify response for undefined values", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: t.context.undefinedreqbody
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("Signup.get: Verify response after getting server error", async (t) => {
  const stub = sinon.stub(Signup, "findOne").throws(new Error("Server Error"))
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: t.context.reqbody
  })
  t.is(status, 500)
  t.true(body.error)
  stub.restore()
})
