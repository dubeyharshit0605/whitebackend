const assert = require("node:assert/strict");
const test = require("node:test");

const Canvas = require("../models/canavasModel");
const canvasController = require("../controllers/canavascontroller");

function responseRecorder() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function routeTable(router) {
  return router.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods).sort(),
    }));
}

test("canvas router registers only the supported authenticated routes", () => {
  const router = require("../routes/canavasRoute");

  assert.deepEqual(routeTable(router), [
    { path: "/", methods: ["get"] },
    { path: "/", methods: ["post"] },
    { path: "/load/:id", methods: ["get"] },
    { path: "/:id", methods: ["put"] },
  ]);
});

test("loadCanvas returns 400 for an invalid canvas ID", async (t) => {
  assert.equal(typeof canvasController.loadCanvas, "function");
  t.mock.method(Canvas, "loadcanvas", async () => {
    throw new Error("Invalid canvas ID");
  });
  const res = responseRecorder();

  await canvasController.loadCanvas(
    { email: "member@example.com", params: { id: "bad-id" } },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: "Invalid canvas ID" });
});

test("loadCanvas returns 403 when the user lacks access", async (t) => {
  assert.equal(typeof canvasController.loadCanvas, "function");
  t.mock.method(Canvas, "loadcanvas", async () => {
    throw new Error("User does not have access to this canvas");
  });
  const res = responseRecorder();

  await canvasController.loadCanvas(
    { email: "member@example.com", params: { id: "507f1f77bcf86cd799439011" } },
    res
  );

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, {
    message: "User does not have access to this canvas",
  });
});

test("updateCanvas passes only editable fields to the model", async (t) => {
  assert.equal(typeof canvasController.updateCanvas, "function");
  const updatedCanvas = { _id: "507f1f77bcf86cd799439011", title: "Updated" };
  const updateCanvas = t.mock.method(Canvas, "updateCanvas", async () =>
    updatedCanvas
  );
  const res = responseRecorder();

  await canvasController.updateCanvas(
    {
      userId: "507f191e810c19729de860ea",
      params: { id: "507f1f77bcf86cd799439011" },
      body: {
        title: "Updated",
        elements: [],
        backgroundColor: "#ffffff",
        thumbnailUrl: "data:image/png;base64,preview",
        owner: "attacker-controlled-owner",
      },
    },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body, updatedCanvas);
  assert.deepEqual(updateCanvas.mock.calls[0].arguments, [
    "507f191e810c19729de860ea",
    "507f1f77bcf86cd799439011",
    {
      title: "Updated",
      elements: [],
      backgroundColor: "#ffffff",
      thumbnailUrl: "data:image/png;base64,preview",
    },
  ]);
});

test("updateCanvas returns 403 when the user cannot edit the canvas", async (t) => {
  assert.equal(typeof canvasController.updateCanvas, "function");
  t.mock.method(Canvas, "updateCanvas", async () => {
    throw new Error("User does not have access to this canvas");
  });
  const res = responseRecorder();

  await canvasController.updateCanvas(
    {
      userId: "507f191e810c19729de860ea",
      params: { id: "507f1f77bcf86cd799439011" },
      body: { title: "Updated" },
    },
    res
  );

  assert.equal(res.statusCode, 403);
});

test("canvas model allows a shared user to save edits", async () => {
  const sharedUserId = "507f191e810c19729de860ea";
  const canvas = {
    title: "Original",
    owner: { equals: () => false },
    sharedWith: [{ equals: (value) => value === sharedUserId }],
    async save() {
      return this;
    },
  };

  const result = await Canvas.updateCanvas.call(
    { findById: async () => canvas },
    sharedUserId,
    "507f1f77bcf86cd799439011",
    { title: "Shared edit" }
  );

  assert.equal(result.title, "Shared edit");
});

test("canvas model rejects edits from users without access", async () => {
  const canvas = {
    owner: { equals: () => false },
    sharedWith: [{ equals: () => false }],
  };

  await assert.rejects(
    Canvas.updateCanvas.call(
      { findById: async () => canvas },
      "507f191e810c19729de860ea",
      "507f1f77bcf86cd799439011",
      { title: "Forbidden edit" }
    ),
    { message: "User does not have access to this canvas" }
  );
});
