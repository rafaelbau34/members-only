const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const db = require("../db/queries");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

router.get("/", messageController.index);

router.get("/sign-up", (req, res) => res.render("sign-up", { errors: [] }));

router.post("sign-up", [
  body("firstName")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name required"),
  body("lastName")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Last name required"),
  body("username")
    .trim()
    .isEmail()
    .escape()
    .withMessage("Valid email required"),
  body("password")
    .isLength({ min: 4 })
    .withMessage("Password must be at least 4 characters"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("sign-up", { errors: errors.array() });
    }
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await db.createUser(
        req.body.firstName,
        req.body.lastName,
        req.body.username,
        hashedPassword,
      );
      res.redirect("/login");
    } catch (err) {
      next(err);
    }
  },
]);

router.get("/login", (req, res) => res.render("login", { error: null }));

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureMessage: true,
  }),
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

router.get("/join-club", (req, res) => {
  if (!req.user) return res.redirect("/access-denied");
  res.render("join-club", { error: null });
});

router.post("/join-club", async (req, res, next) => {
  if (!req.user) return res.redirect("/access-denied");
  if (req.body.passcode === "SECRET_CODE") {
    try {
      await db.updateMembershipStatus(req.user.id, true);
      res.redirect("/");
    } catch (err) {
      next(err);
    }
  } else {
    res.render("join-club", { error: "Incorrect passcode" });
  }
});

router.get("/create-message", messageController.createMessageGet);
router.post("/create-message", messageController.createMessagePost);

router.post("/delete-message/:id", messageController.deleteMessagePost);

router.get("/become-admin-portal-1234", async (req, res, next) => {
  if (!req.user) return res.redirect("/access-denied");
  try {
    await db.updateAdminStatus(req.user.id, true);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

router.get("/access-denied", (req, res) => res.render("access-denied"));

module.exports = router;
