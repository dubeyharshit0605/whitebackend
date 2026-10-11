const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxlength: 100,
            validate: {
                validator: (email) => validator.isEmail(email),
                message: "Please enter a valid email address",
            },
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
    },
    {
        timestamps: true,
        collection: "users",
        toJSON: {
            transform: (_doc, ret) => {
                delete ret.password;
                return ret;
            },
        },
    }
);

userSchema.statics.register = async function register(name, email, password) {
    if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof email !== "string" ||
        !email.trim() ||
        typeof password !== "string" ||
        !password
    ) {
        throw new Error("Name, email, and password are required");
    }

    name = name.trim();
    email = email.trim();

    if (!validator.isEmail(email)) {
        throw new Error("Please enter a valid email address");
    }

    if (
        !validator.isStrongPassword(password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
    ) {
        throw new Error(
            "Password must have at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a symbol"
        );
    }

    // bcrypt only processes the first 72 bytes.
    if (Buffer.byteLength(password, "utf8") > 72) {
        throw new Error("Password must not exceed 72 bytes");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new this({
        name,
        email,
        password: hashedPassword,
    });

    await user.save();
    return user;
};

userSchema.methods.comparePassword = async function comparePassword(password) {
    return bcrypt.compare(password, this.password);
};

userSchema.statics.getUser = async function getUser(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid user ID");
  }

  const user = await this.findById(id);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

userSchema.statics.login = async function login(email, password) {
    if (
        typeof email !== "string" ||
        !email.trim() ||
        typeof password !== "string" ||
        !password
    ) {
        throw new Error("Email and password are required");
    }

    const user = await this.findOne({
        email: email.trim(),
    }).select("+password");

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        throw new Error("Invalid email or password");
    }

    return user;
};

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;