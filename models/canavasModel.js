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
    // Stable ID used by React to update or delete an element.
    id: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["pen", "line", "rectangle", "ellipse", "text", "image"],
      required: true,
    },

    // Element position on the board.
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },

    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    rotation: { type: Number, default: 0 },

    strokeColor: { type: String, default: "#000000" },
    strokeWidth: { type: Number, default: 2, min: 0 },
    fillColor: { type: String, default: "transparent" },

    // Points for freehand drawing and lines.
    points: {
      type: [pointSchema],
      default: [],
    },

    // Text element properties.
    text: { type: String, default: "" },
    fontSize: { type: Number, default: 20, min: 1 },
    fontFamily: { type: String, default: "Arial" },

    // Store the image URL, rather than image bytes.
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
          return new Set(elements.map((element) => element.id)).size
            === elements.length;
        },
        message: "Element IDs must be unique within a canvas",
      },
    },

    // IDs of users this board is shared with.
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

    // Small preview image for the user's board list.
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

//get all canavasfor user and both owner
canvasSchema.statics.getallcanavas = async function findByUserId(email) {
    const user = await mongoose.model("User").findOne({ email });
    try {
      if (!user) {
        throw new Error("User not found");
      }
  
      return this.find({
        $or: [
          { owner: user._id },
          { sharedWith: user._id },
        ],
      }).sort({ updatedAt: -1 });
    } catch (error) {
      console.error("Error fetching canvases:", error);
      throw error;
    }
  };
  
  canvasSchema.statics.getCanvasesByUserId = async function findByUserId(email) {
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
  };    

  canvasSchema.statics.createCanvas = async function createCanvas(title, ownerId) {
const user=await mongoose.model("User").findById(ownerId);
if(!user){
    throw new Error("User not found");
}
const canvas=new this({
    title,
    owner:ownerId,
    elements:[],
    sharedWith:[],
});
const newcanvas=await canvas.save();
return newcanvas;
};
// Support listing owned and shared boards, newest first.
canvasSchema.index({ owner: 1, updatedAt: -1 });
canvasSchema.index({ sharedWith: 1, updatedAt: -1 });

const Canvas = mongoose.model("Canvas", canvasSchema);

module.exports = Canvas;