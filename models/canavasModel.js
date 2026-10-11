const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  { _id: false }
);

const elementSchema = new mongoose.Schema(
  {
    // Stable ID used by React.
    id: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["pen", "line", "rectangle", "ellipse", "text", "image"],
      required: true,
    },

    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },

    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    rotation: { type: Number, default: 0 },

    strokeColor: { type: String, default: "#000000" },
    strokeWidth: { type: Number, default: 2, min: 0 },
    fillColor: { type: String, default: "transparent" },

    points: {
      type: [pointSchema],
      default: [],
    },

    text: { type: String, default: "" },
    fontSize: { type: Number, default: 20, min: 1 },
    fontFamily: { type: String, default: "Arial" },

    imageUrl: { type: String, default: "" },
  },
  { _id: false }
);

const canvasSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      default: "Untitled board",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },

    elements: {
      type: [elementSchema],
      default: [],
      validate: {
        validator(elements) {
          return (
            new Set(elements.map((element) => element.id)).size ===
            elements.length
          );
        },
        message: "Element IDs must be unique within a canvas",
      },
    },

    sharedWith: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },

    backgroundColor: {
      type: String,
      default: "#ffffff",
    },

    thumbnailUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "canvases",
  }
);

// List owned and shared canvases using the user's email.
async function findCanvasesByEmail(email) {
  const user = await mongoose.model("User").findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  return this.find({
    $or: [
      { owner: user._id },
      { sharedWith: user._id },
    ],
  }).sort({ updatedAt: -1 });
}

// Keep both existing method names compatible.
// Both accept an email, matching your previous code.
canvasSchema.statics.getallcanavas = findCanvasesByEmail;
canvasSchema.statics.getCanvasesByUserId = findCanvasesByEmail;

// Create a canvas using the authenticated user's ID.
canvasSchema.statics.createCanvas = async function (title, ownerId) {
  if (!ownerId || !mongoose.isValidObjectId(ownerId)) {
    throw new Error("Invalid owner ID");
  }

  const user = await mongoose.model("User").findById(ownerId);

  if (!user) {
    throw new Error("User not found");
  }

  return this.create({
    title,
    owner: user._id,
    elements: [],
    sharedWith: [],
  });
};

// Load one canvas only if the user owns it or has shared access.
canvasSchema.statics.loadcanvas = async function (email, id) {
  if (!id || !mongoose.isValidObjectId(id)) {
    throw new Error("Invalid canvas ID");
  }

  const user = await mongoose.model("User").findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  const canvas = await this.findById(id);

  if (!canvas) {
    throw new Error("Canvas not found");
  }

  const isOwner = canvas.owner.equals(user._id);

  const isSharedUser = canvas.sharedWith.some((sharedUserId) =>
    sharedUserId.equals(user._id)
  );

  if (!isOwner && !isSharedUser) {
    throw new Error("User does not have access to this canvas");
  }

  return canvas;
};

canvasSchema.statics.updateCanvas = async function (userId, id, updates) {
  if (!userId || !mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid user ID");
  }

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new Error("Invalid canvas ID");
  }

  const canvas = await this.findById(id);

  if (!canvas) {
    throw new Error("Canvas not found");
  }

  const isOwner = canvas.owner.equals(userId);
  const isSharedUser = canvas.sharedWith.some((sharedUserId) =>
    sharedUserId.equals(userId)
  );

  if (!isOwner && !isSharedUser) {
    throw new Error("User does not have access to this canvas");
  }

  Object.assign(canvas, updates);
  return canvas.save();
};

canvasSchema.index({ owner: 1, updatedAt: -1 });
canvasSchema.index({ sharedWith: 1, updatedAt: -1 });

const Canvas = mongoose.model("Canvas", canvasSchema);

module.exports = Canvas;
