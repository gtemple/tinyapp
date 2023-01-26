const { assert } = require("chai");

const { getUserByEmail } = require("../serverHelpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("getUserByEmail", function() {
  it("should return a user with valid email", function() {
    const user = getUserByEmail(testUsers, "user@example.com");
    const expectedUserID = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur",
    };
    assert.deepEqual(user, expectedUserID);
  });
  it("should return undefined without a valid ID", function() {
    const user = getUserByEmail(testUsers, "thataintit@example.com");
    const expectedUserID = undefined;
    assert.deepEqual(user, expectedUserID);
  });
});
