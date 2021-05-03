const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function dishIsValid(req, res, next) {
  const {
    name = "",
    description = "",
    price = 0,
    image_url = "",
  } = req.body.data;

  if (name === undefined || name === "") {
    next({ status: 400, message: "Dish must include a name" });
  } else if (description === undefined || description === "") {
    next({ status: 400, message: "Dish must include a description" });
  } else if (price === undefined) {
    next({ status: 400, message: "Dish must include a price" });
  } else if (price <= 0) {
    next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  } else if (!Number.isInteger(price)) {
    next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  } else if (image_url === undefined || image_url === "") {
    next({ status: 400, message: "Dish must include a image_url" });
  } else {
    res.locals.dish = req.body.data;
    next();
  }
}
function create(req, res, next) {
  const { dish } = res.locals;
  const id = nextId();
  const newDish = { ...dish, id };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}
function dishExists(req, res, next) {
  const { dishId } = req.params;
  const dish = dishes.find((dish) => dish.id === dishId);

  if (dish === undefined) {
    next({ status: 404, message: `Dish does not exist: ${dishId}` });
  } else {
    res.locals.Origdish = dish;
    res.locals.dishId = dishId;
    next();
  }
}
function read(req, res, next) {
  const { Origdish } = res.locals;
  res.status(200).json({ data: Origdish });
}

function dishIdMatchesRoute(req, res, next) {
  const { dishId } = res.locals;
  const { dish } = res.locals;
  if (dishId === dish.id) {
    next();
  } else {
    if (dish.id) {
      if (dish.id !== dishId) {
        next({
          status: 400,
          message: `Dish id does not match route id. Dish: ${dish.id}, Route: ${dishId}`,
        });
      }
    }
    next();
  }
}
function update(req, res) {
  const dish = req.body.data;
  const { dishId } = req.params;
  const Origdish = dishes.find((dish) => dish.id === dishId);
  const index = dishes.findIndex((dish) => dish.id === dishId);

  dish.id = dishId;

  dishes[index] = { ...Origdish, ...dish };

  res.status(200).json({ data: dishes[index] });
}

function list(req, res, next) {
  res.json({ data: dishes });
}

module.exports = {
  create: [dishIsValid, create],
  list,
  read: [dishExists, read],
  update: [dishExists, dishIsValid, dishIdMatchesRoute, update],
};
