const db = require("../db/queries");
const { body, validationResult } = require("express-validator");

exports.index = async (req, res, next) => {
  try {
    const messages = await db.getAllMessages();
    res.render("index", { messages });
  } catch (err) {
    next(err);
  }
};

exports.createMessageGet = (req, res) => {
  if (!req.user) return res.redirect("/access-denied");
  res.render("create-message", { errors: [] });
};

exports.createMessagePost = [
  body("title")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Title is required")
    .escape(),
  body("text")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Text is required")
    .escape(),
  async (req, res, next) => {
    if (!req.user) return res.redirect("/access-denied");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("create-message", { errors: errors.array() });
    }
    try {
      await db.createMessage(req.body.title, req.body.text, req.user.id);
      res.redirect("/");
    } catch (err) {
      next(err);
    }
  },
];

exports.deleteMessagePost = async (req, res, next) => {
  if (!req.user || !req.user.is_admin) return res.redirect("/access-denied");
  try {
    await db.deleteMessage(req.params.id);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};
