const test = require("ava")
const sinon = require("sinon")
// const Joi = require("joi")
const {
  runRouteHandler, setupMongo, teardownMongo, setupFixtures, teardownFixtures
} = require("../../../../_utils")
const { put } = require("../../../../../routes/rest/users")
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
    password: "test2",
    name: {
      first: "Rohit",
      last: "Santra"
    },
    phoneNumber: "9038826507",
    email: "laxman@test.com",
    isActiveStatus: true,
  }
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

// const responseSchema = Joi.object().keys({
//   name: Joi.object(),
//   _id: Joi.string(),
//   userName: Joi.string(),
//   email: Joi.string(),
//   phoneNumber: Joi.string(),
//   isActiveStatus: Joi.boolean(),
//   _createdBy: Joi.string(),
//   _updatedBy: Joi.string(),
//   createdAt: Joi.string(),
//   updatedAt: Joi.string(),
//   __v: Joi.number(),
//   id: Joi.string()
// })

test.serial("User.put: Verify response after entering valid user id", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: t.context.reqbody,
    auth: t.context.authId
  })
  // const { error } = responseSchema.validate(body.user, { abortEarly: false })
  // t.true(error === undefined, error?.message)
  t.is(body.user.name.first, t.context.reqbody.name.first)
  t.is(body.user.name.last, t.context.reqbody.name.last)
  t.is(body.user.phoneNumber, t.context.reqbody.phoneNumber)
  t.is(body.user.email, t.context.reqbody.email)
  t.is(body.user.isActiveStatus, t.context.reqbody.isActiveStatus)
  t.is(body.user._updatedBy, t.context.authId._id)
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.put: Verify response after entering integer value in password", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, password: 1 },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.put: Verify response after entering blanl value in password", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, password: " " },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.put: Verify response after entering array value in password", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, password: ["test3"] },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.put: Verify response after entering extra spaces before and after the password", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, password: "   test3  " },
    auth: t.context.authId
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.put: Verify response after entering undefined value in password", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, password: undefined },
    auth: t.context.authId
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.put: Verify response after entering null value in password", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, password: null },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.put: Verify response after entering boolean value in password", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, password: true },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.put: Verify response after entering integer value in firstname", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
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

test.serial("User.put: Verify response after entering blank value in firstname", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
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

test.serial("User.put: Verify response after entering array value in firstname", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
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

test.serial("User.put: Verify response after entering extra spaces before and after the firstname", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
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

test.serial("User.put: Verify response after entering undefined value in firstname", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: {
      ...t.context.reqbody,
      name: {
        first: undefined,
        last: "Charan"
      }
    },
    auth: t.context.authId
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.put: Verify response after entering null value in firstname", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
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

test.serial("User.put: Verify response after entering boolean value in firstname", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
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

test.serial("User.put: Verify response after entering integer value in Lastname", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
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

test.serial("User.put: Verify response after entering blank value in Lastname", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
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

test.serial("User.put: Verify response after entering array value in Lastname", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
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

test.serial("User.put: Verify response after entering extra spaces before and after the Lastname", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
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

test.serial("User.put: Verify response after entering undefined value in Lastname", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: {
      ...t.context.reqbody,
      name: {
        first: "Ram",
        last: undefined
      }
    },
    auth: t.context.authId
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.put: Verify response after entering null value in Lastname", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
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

test.serial("User.put: Verify response after entering boolean value in Lastname", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
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

test.serial("User.put: Verify response after entering undefined value in name", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: {
      ...t.context.reqbody,
      name: undefined
    },
    auth: t.context.authId
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.put: Verify response after entering null value in name", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: {
      ...t.context.reqbody,
      name: null
    },
    auth: t.context.authId
  })
  t.is(status, 500)
  t.true(body.error)
})

test.serial("User.put: Verify response after entering boolean value in name", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: {
      ...t.context.reqbody,
      name: true
    },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.put: Verify response after entering integer value in phoneNumber", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, phoneNumber: 1 },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.put: Verify response after entering blank value in phoneNumber", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, phoneNumber: " " },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.put: Verify response after entering array value in phoneNumber", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, phoneNumber: ["9038826507"] },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.put: Verify response after entering invalid value in phoneNumber", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, phoneNumber: "X" },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.put: Verify response after entering extra space before and after the phoneNumber", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, phoneNumber: "  9038826507  " },
    auth: t.context.authId
  })
  const newphoneNumber = "9038826507"
  t.is(body.user.phoneNumber, newphoneNumber)
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.put: Verify response after entering undefined value in phoneNumber", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, phoneNumber: undefined },
    auth: t.context.authId
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.put: Verify response after entering null value in phoneNumber", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, phoneNumber: null },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.put: Verify response after entering boolean value in phoneNumber", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, phoneNumber: true },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.put: Verify response after entering integer value in email", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, email: 1 },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.put: Verify response after entering invalid value in email", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, email: "xyz@xyz" },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.put: Verify response after entering blank value in email", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, email: " " },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.put: Verify response after entering array value in email", async (t) => {
  const { body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, email: ["xyz@xyz.com"] },
    auth: t.context.authId
  })
  // t.is(status, 400)
  t.true(body.error)
})

test.serial("User.put: Verify response after entering extra space before and after the email", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, email: "  xyz@xyz.com   " },
    auth: t.context.authId
  })
  const newemail = "xyz@xyz.com"
  t.is(body.user.email, newemail)
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.put: Verify response after entering undefined value in email", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, email: undefined },
    auth: t.context.authId
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.put: Verify response after entering null value in email", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, email: null },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.put: Verify response after entering boolean value in email", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, email: true },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.put: Verify response after entering integer value in isActiveStatus", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, isActiveStatus: 1 },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.put: Verify response after entering string value in isActiveStatus", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, isActiveStatus: "true" },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.put: Verify response after entering array value in isActiveStatus", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, isActiveStatus: ["true"] },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.put: Verify response after entering false value in isActiveStatus", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, isActiveStatus: false },
    auth: t.context.authId
  })
  const newisActiveStatus = false
  t.is(body.user.isActiveStatus, newisActiveStatus)
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.put: Verify response after entering undefined value in isActiveStatus", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, isActiveStatus: undefined },
    auth: t.context.authId
  })
  t.is(status, 200)
  t.false(body.error)
})

test.serial("User.put: Verify response after entering null value in isActiveStatus", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: { ...t.context.reqbody, isActiveStatus: null },
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.put: Verify response after entering invalid user id", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.invaliduserDataId
    },
    body: t.context.reqbody,
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.put: Verify response after entering invalid formatted user id", async (t) => {
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.invalidformatteduserDataId
    },
    body: t.context.reqbody,
    auth: t.context.authId
  })
  t.is(status, 400)
  t.true(body.error)
})

test.serial("User.put: Verify response after getting server error", async (t) => {
  const stub = sinon.stub(User, "findOne").throws(new Error("Server Error"))
  const { status, body } = await runRouteHandler(put, {
    method: "PUT",
    params: {
      id: t.context.validuserDataId
    },
    body: t.context.reqbody,
    auth: t.context.authId
  })
  t.is(status, 500)
  t.true(body.error)
  stub.restore()
})
