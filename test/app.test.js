const assert = require("node:assert/strict");
const test = require("node:test");

const db = require("../db");
const express = require("express");
const postModel = require("../models/postModel");

test("importing the application does not connect or listen", async (t) => {
  const connectToDatabase = t.mock.method(db, "connectToDatabase", async () => {});
  const listen = t.mock.method(express.application, "listen", () => {});
  const mongodbUri = process.env.MONGODB_URI;
  delete process.env.MONGODB_URI;
  t.after(() => {
    if (mongodbUri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = mongodbUri;
  });
  delete require.cache[require.resolve("../index")];

  const backend = require("../index");
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(typeof backend.app, "function");
  assert.equal(connectToDatabase.mock.callCount(), 0);
  assert.equal(listen.mock.callCount(), 0);
  assert.equal(process.env.MONGODB_URI, undefined);
});

test("GET /posts/:id is mounted on the application", async (t) => {
  const expectedPost = {
    _id: "507f1f77bcf86cd799439011",
    title: "Hello",
    content: "World",
  };
  t.mock.method(postModel, "getpost", async () => expectedPost);
  delete require.cache[require.resolve("../index")];
  const { app } = require("../index");
  const server = app.listen(0, "127.0.0.1");
  t.after(() => server.close());
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();

  const response = await fetch(
    `http://127.0.0.1:${address.port}/posts/507f1f77bcf86cd799439011`
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), expectedPost);
});

test("canvas and user routers are mounted on the application", async (t) => {
  delete require.cache[require.resolve("../index")];
  const { app } = require("../index");
  const server = app.listen(0, "127.0.0.1");
  t.after(() => server.close());
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const [canvasResponse, canvasUpdateResponse, profileResponse] = await Promise.all([
    fetch(`${baseUrl}/canvas`),
    fetch(`${baseUrl}/canvas/507f1f77bcf86cd799439011`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Unauthorized update" }),
    }),
    fetch(`${baseUrl}/users/profile`),
  ]);

  assert.equal(canvasResponse.status, 401);
  assert.equal(canvasUpdateResponse.status, 401);
  assert.equal(profileResponse.status, 401);
});
