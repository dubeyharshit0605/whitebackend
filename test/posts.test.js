const assert = require("node:assert/strict");
const test = require("node:test");

function routeTable(router) {
  return router.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods).sort(),
    }));
}

test("post router registers collection creation and ID lookup routes", () => {
  const router = require("../routes/postRoutes");

  assert.deepEqual(routeTable(router), [
    { path: "/:id", methods: ["get"] },
    { path: "/", methods: ["post"] },
  ]);
});
