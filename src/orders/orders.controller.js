const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function orderIsValid(req, res, next) {
  const { deliverTo = "", mobileNumber = "", dishes = [] } = req.body.data;
  if (deliverTo === undefined || deliverTo === "") {
    next({ status: 400, message: "Order must include a deliverTo" });
  }
  if (mobileNumber === undefined || mobileNumber === "") {
    next({ status: 400, message: "Order must include a mobileNumber" });
  }
  if (dishes === undefined || !Array.isArray(dishes)) {
    next({ status: 400, message: "Order must include at least one dish" });
  }
  if (dishes.length === 0) {
    next({ status: 400, message: "Order must include at least one dish" });
  }
  for (let index = 0; index < dishes.length; index++) {
    let dish = dishes[index];
    if (
      dish.quantity === undefined ||
      dish.quantity <= 0 ||
      !Number.isInteger(dish.quantity)
    ) {
      next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  }
  res.locals.order = req.body.data;
  next();
}

function create(req, res) {
  const { order } = res.locals;
  const id = nextId();
  const newOrder = { ...order, id };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const order = orders.find((order) => order.id === orderId);

  if (order === undefined) {
    next({ status: 404, message: `Order not found: ${orderId}` });
  } else {
    res.locals.Origorder = order;
    next();
  }
}

function read(req, res) {
  const { Origorder } = res.locals;

  res.status(200).json({ data: Origorder });
}

function orderStatus(req, res, next) {
  const { order } = res.locals;
  const { status = "" } = order;
  const { orderId } = req.params;

  if (order.id) {
    if (order.id !== orderId) {
      next({
        status: 400,
        message: `Order id does not match route id. Order: ${order.id}, Route: ${orderId}.`,
      });
    }
  }

  if (status === undefined || status === "" || status === "invalid") {
    next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  }

  if (status === "delivered") {
    next({ status: 400, message: "A delivered order cannot be changed" });
  }
  res.locals.orderId = orderId;
  next();
}

function update(req, res) {
  const { Origorder } = res.locals;
  const { orderId } = res.locals;
  const { order } = res.locals;

  const index = orders.indexOf((order) => order.id === orderId);

  order.id = orderId;

  orders[index] = { ...Origorder, ...order };
  res.status(200).json({ data: orders[index] });
}

function destroy(req, res, next) {
  const { orderId } = req.params;
  const { Origorder } = res.locals;

  if (Origorder.status === "pending") {
    const index = orders.indexOf((order) => order.id === orderId);
    orders.splice(index, 1);
    res.sendStatus(204);
  } else {
    next({
      status: 400,
      message: "An order cannot be deleted unless it is pending",
    });
  }
}

function list(req, res, next) {
  res.status(200).json({ data: orders });
}

module.exports = {
  create: [orderIsValid, create],
  read: [orderExists, read],
  update: [orderExists, orderIsValid, orderStatus, update],
  destroy: [orderExists, destroy],
  list,
};
