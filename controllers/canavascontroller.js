const Canvas = require("../models/canavasModel");

const getcanvas = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authenticated user ID is missing",
      });
    }

    const data = await Canvas.find({
      $or: [
        { owner: req.userId },
        { sharedWith: req.userId },
      ],
    }).sort({ updatedAt: -1 });

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching canvases:", error);

    return res.status(500).json({
      message: "Failed to fetch canvases",
    });
  }
};

const createCanvas = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authenticated user ID is missing",
      });
    }

    const title = req.body?.title ?? "Untitled board";

    // Uses your model's custom method, which checks the user exists.
    const data = await Canvas.createCanvas(title, req.userId);

    return res.status(201).json(data);
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(401).json({
        message: "Authenticated user no longer exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error("Error creating canvas:", error);

    return res.status(500).json({
      message: "Failed to create canvas",
    });
  }
};

const loadCanvas = async (req, res) => {
  const email = req.email;
  const id = req.params.id;

  try {
    const canvas = await Canvas.loadcanvas(email, id);
    return res.status(200).json(canvas);
  } catch (error) {
    if (error.message === "Invalid canvas ID") {
      return res.status(400).json({ message: error.message });
    }

    if (error.message === "User not found") {
      return res.status(401).json({
        message: "Authenticated user no longer exists",
      });
    }
    if (error.message === "Canvas not found") {
      return res.status(404).json({
        message: "Canvas not found",
      });
    }

    if (error.message === "User does not have access to this canvas") {
      return res.status(403).json({ message: error.message });
    }

    console.error("Error loading canvas:", error);
    return res.status(500).json({
      message: "Failed to load canvas",
    });
  }
};

const editableCanvasFields = [
  "title",
  "elements",
  "backgroundColor",
  "thumbnailUrl",
];

const updateCanvas = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authenticated user ID is missing",
      });
    }

    const updates = Object.fromEntries(
      editableCanvasFields
        .filter((field) => Object.hasOwn(req.body || {}, field))
        .map((field) => [field, req.body[field]])
    );

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No editable canvas fields were provided",
      });
    }

    const canvas = await Canvas.updateCanvas(
      req.userId,
      req.params.id,
      updates
    );

    return res.status(200).json(canvas);
  } catch (error) {
    if (
      error.message === "Invalid user ID" ||
      error.message === "Invalid canvas ID"
    ) {
      return res.status(400).json({ message: error.message });
    }

    if (error.message === "Canvas not found") {
      return res.status(404).json({ message: error.message });
    }

    if (error.message === "User does not have access to this canvas") {
      return res.status(403).json({ message: error.message });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    console.error("Error updating canvas:", error);
    return res.status(500).json({ message: "Failed to update canvas" });
  }
};
const sharingCanvas = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authenticated user ID is missing",
      });
    }

    const { sharedWith } = req.body;

    if (!Array.isArray(sharedWith)) {
      return res.status(400).json({
        message: "sharedWith must be an array of user IDs",
      });
    }

    const canvas = await Canvas.updateCanvas(
      req.userId,
      req.params.id,
      { sharedWith }
    );

    return res.status(200).json(canvas);
  } catch (error) {
    if (
      error.message === "Invalid user ID" ||
      error.message === "Invalid canvas ID"
    ) {
      return res.status(400).json({ message: error.message });
    }

    if (error.message === "Canvas not found") {
      return res.status(404).json({ message: error.message });
    }

    if (error.message === "User does not have access to this canvas") {
      return res.status(403).json({ message: error.message });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    console.error("Error sharing canvas:", error);
    return res.status(500).json({ message: "Failed to share canvas" });
  }
}
module.exports = { getcanvas, createCanvas, loadCanvas, updateCanvas };
