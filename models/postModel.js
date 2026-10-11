const mongoose = require("mongoose");

const postscheme = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    numberoflikes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "modifiedAt",
    },
    collection: "test",
  }
);

postscheme.statics.createpost = async function (title, content) {
  const post = await this.create({ title, content });
  return post;
};

postscheme.statics.getpost = async function (id) {
  const post = await this.findById(id);

  if (!post) {
    throw new Error("Post not found");
  }

  return post;
};

const postModel = mongoose.model("post", postscheme);

module.exports = postModel;