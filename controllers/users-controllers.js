const { nanoid } = require("nanoid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const signupUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs data", 422));
  }

  try {
    const existingUser = await User.findOne({ emai: req.body.email });
    if (existingUser)
      return next(new HttpError("email already exists in database", 422));
  } catch (error) {
    return next(new HttpError("internal server error", 500));
  }

  let user = new User({
    ...req.body,
    image: "https://via.placeholder.com/150/771796",
  });
  try {
    await user.save();
  } catch (error) {
    return next(new HttpError("internal server error", 500));
  }

  res.status(201).send(user.toObject({ getters: true }));
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  let user;
  try {
    user = await User.findByEmailAndPassword(email, password);
    if (!user) return next(new HttpError("email or password is wrong", 422));
  } catch (error) {
    return next(new HttpError("internal server error", 500));
  }

  res.send(user);
};

const deleteUser = (req, res, next) => {
  const NEW_USERS = USERS.filter((u) => u.id !== req.params.uid);

  if (NEW_USERS.length === USERS.length) {
    return next(new HttpError("no user found", 404));
  }
  USERS = NEW_USERS;
  res.send();
};

const updateUser = (req, res, next) => {
  const indexOfUser = USERS.findIndex((u) => u.id === req.params.uid);

  if (indexOfUser === -1) {
    return next(new HttpError("no user found", 404));
  }

  for (key in req.body) {
    USERS[indexOfUser][key] = req.body[key];
  }
  res.send(USERS[indexOfUser]);
};

const findAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (error) {
    return next(new HttpError("internal server error", 500));
  }

  res.send(users.map((user) => user.toObject({ getters: true })));
};

module.exports = {
  signupUser,
  loginUser,
  deleteUser,
  updateUser,
  findAllUsers,
};
