const test = require("ava")
const sinon = require("sinon")
// const Joi = require("joi")
const {
  runRouteHandler, setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("../../../../_utils")
const { post } = require("../../../../../routes/rest/users")
const User = require("../../../../../models/user")

/** Setup & Teardown code (COMMON) */
test.before(setupMongo)
test.after.always(teardownMongo)
test.beforeEach(setupFixtures)
test.afterEach(teardownFixtures)
/* ******************************* */

test.beforeEach(async (t) => {
  // eslint-disable-next-line no-param-reassign
  t.context.reqbody = {
    userName: "test1",
    password: "test1",
    name: {
      first: "Ram",
      last: "Charan"
    },
    isActive: true,
    email: "ram@test.com",
    phone: "9977665594",
  }
  // eslint-disable-next-line no-param-reassign
  t.context.authId = {
    _id: "64645fc10adf19295e261088"
  }
})

// const responseSchema = Joi.object().keys({
//   userName: Joi.string(),
//   name: Joi.object(),
//   email: Joi.string(),
//   phone: Joi.string(),
//   isActive: Joi.boolean(),
//   _createdBy: Joi.string(),
//   _updatedBy: [Joi.string(), Joi.allow(null)],
//   _id: Joi.string(),
//   createdAt: Joi.string(),
//   updatedAt: Joi.string(),
//   __v: Joi.number(),
//   id: Joi.string()
// })

test.serial("User.post: Verify response after entering valid data", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: t.context.reqbody,
    auth: t.context.authId
  })
  // const { error } = responseSchema.validate(body.user, { abortEarly: false })
  // t.true(error === undefined, error?.message)
  t.is(body.user.userName, t.context.reqbody.userName)
  t.is(body.user.name.first, t.context.reqbody.name.first)
  t.is(body.user.name.last, t.context.reqbody.name.last)
  t.is(body.user.isActive, t.context.reqbody.isActive)
  t.is(body.user.email, t.context.reqbody.email)
  t.is(body.user.phone, t.context.reqbody.phone)
  t.is(body.user._createdBy, t.context.authId._id)
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.post: Verify response after entering integer value in userName", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, userName: 1 },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering blank value in userName", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, userName: " " },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering array value in userName", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, userName: ["test2"] },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering extra spaces before and after the userName", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, userName: "   test2   " },
    auth: t.context.authId
  })
  const newuserName = "test2"
  t.is(body.user.userName, newuserName)
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.post: Verify response after entering undefined value in userName", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, userName: undefined },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering null value in userName", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, userName: null },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering boolean value in userName", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, userName: true },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering integer value in password", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, password: 1 },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering blank value in password", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, password: " " },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.skip("User.post: Verify response after entering array value in password", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, password: ["test2"] },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering extra spaces before and after the password", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, password: "   test2   " },
    auth: t.context.authId
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.post: Verify response after entering undefined value in password", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, password: undefined },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.skip("User.post: Verify response after entering null value in password", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, password: null },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering boolean value in password", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, password: true },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering integer value in firstname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: 1,
        last: "Charan"
      }
    },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering blank value in firstname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: " ",
        last: "Charan"
      }
    },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering array value in firstname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: ["Ram"],
        last: "Charan"
      }
    },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering extra spaces before and after the firstname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: "  Ram  ",
        last: "Charan"
      }
    },
    auth: t.context.authId
  })
  const newfirstname = "Ram"
  t.is(body.user.name.first, newfirstname)
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.post: Verify response after entering undefined value in firstname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: undefined,
        last: "Charan"
      }
    },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering null value in firstname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: null,
        last: "Charan"
      }
    },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering boolean value in firstname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: true,
        last: "Charan"
      }
    },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering extra spaces before and after the lastname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: "Ram",
        last: "  Charan  "
      }
    },
    auth: t.context.authId
  })
  const newlasname = "Charan"
  t.is(body.user.name.last, newlasname)
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.post: Verify response after entering integer value in lastname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: "Ram",
        last: 1
      }
    },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering blank value in lastname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: "Ram",
        last: " "
      }
    },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering array value in lastname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: "Ram",
        last: ["Charan"]
      }
    },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering undefined value in lastname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: "Ram",
        last: undefined
      }
    },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering null value in lastname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: "Ram",
        last: null
      }
    },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering boolean value in lastname", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: {
        first: "Ram",
        last: true
      }
    },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering undefined value in name", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: undefined
    },
    auth: t.context.authId
  })
  t.is(status, 500)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering null value in name", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: null
    },
    auth: t.context.authId
  })
  t.is(status, 500)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering boolean value in name", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: {
      ...t.context.reqbody,
      name: true
    },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering integer value in isActive", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, isActive: 1 },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering string value in isActive", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, isActive: "XY" },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering array value in isActive", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, isActive: ["true"] },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering true value in isActive", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, isActive: false },
    auth: t.context.authId
  })
  const newisActive = false
  t.is(body.user.isActive, newisActive)
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.post: Verify response after entering undefined value in isActive", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, isActive: undefined },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering null value in isActive", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, isActive: null },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering integer value in email", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, email: 1 },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering invalid value in email", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, email: "xyz@xyz" },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering blank value in email", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, email: " " },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering array value in email", async (t) => {
  const { body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, email: ["xyz@xyz.com"] },
    auth: t.context.authId
  })
  // t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering extra space before and after the email", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, email: "  xyz@xyz.com  " },
    auth: t.context.authId
  })
  const newemail = "xyz@xyz.com"
  t.is(body.user.email, newemail)
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.post: Verify response after entering undefined value in email", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, email: undefined },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering null value in email", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, email: null },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering boolean value in email", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, email: true },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering integer value in phone", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, phone: 1 },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering blank value in phone", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, phone: " " },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering array value in phone", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, phone: ["1233211234"] },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering invalid value in phone", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, phone: "X" },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering extra space before and after the phone", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, phone: "   9977665594  " },
    auth: t.context.authId
  })
  const newphone = "9977665594"
  t.is(body.user.phone, newphone)
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.post: Verify response after entering undefined value in phone", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, phone: undefined },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering null value in phone", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, phone: null },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after entering boolean value in phone", async (t) => {
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: { ...t.context.reqbody, phone: true },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.post: Verify response after getting server error", async (t) => {
  const stub = sinon.stub(User, "create").throws(new Error("Server Error"))
  const { status, body } = await runRouteHandler(post, {
    method: "POST",
    body: t.context.reqbody,
    auth: t.context.authId
  })
  t.is(status, 500)
  t.true(body.error)
  stub.restore()
})
