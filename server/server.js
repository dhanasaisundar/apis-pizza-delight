import express, { response } from "express";
import cors from "cors";
//import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  createUser,
  getDrinks,
  getPizzas,
  getUser,
  createOrder,
  pizzaOrder,
  drinkOrder,
  getOrder,
  getPizzaOrderInfo,
  getDrinkOrderInfo,
  getIngredients,
  getUserInfoById,
} from "./database.js";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
const PORT = 3000;

/********************************************************************* */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await getUser(username);
    if (!user) {
      res.status(400).send("Invalid username");
    }
    const isAuthenticated = password === user.password;
    if (isAuthenticated === true) {
      const payload = {
        username: username,
      };
      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      res.status(200).send({ jwtToken, user });
    } else {
      res.status(400).send("Invalid password");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/********************************************************************* */
app.get("/pizzas", async (req, res) => {
  try {
    const pizzas = await getPizzas();
    res.status(200).send(pizzas);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
/********************************************************************* */
app.get("/drinks", async (req, res) => {
  try {
    const drinks = await getDrinks();
    res.status(200).send(drinks);
  } catch (error) {
    res.status(500).send(error.mesaage);
  }
});

/********************************************************************* */
app.post("/create-user", async (req, res) => {
  console.log(req.body);
  const { username, password, phoneNo, address, email } = req.body;
  try {
    const userId = await createUser(
      username,
      password,
      phoneNo,
      address,
      email
    );
    res.status(200).send({ userId, message: "User created successfully." });
  } catch (error) {
    res
      .status(500)
      .send({ error: error.message, message: "Failed to create user." });
  }
});
/********************************************************************* */
app.post("/order", async (req, res) => {
  const { orderId, cart, drinksCart, priority, priorityPrice, orderPrice } =
    req.body;
  try {
    await createOrder(orderId, priority, priorityPrice, orderPrice);

    if (cart.length > 0) {
      // Use Promise.all to await all promises in parallel
      await Promise.all(
        cart.map(async (element) => {
          await pizzaOrder(
            orderId,
            element.pizzaId,
            element.quantity,
            element.totalPrice
          );
        })
      );
    }

    if (drinksCart.length > 0) {
      // Use Promise.all to await all promises in parallel
      await Promise.all(
        drinksCart.map(async (element) => {
          await drinkOrder(
            orderId,
            element.drinkId,
            element.quantity,
            element.totalPrice
          );
        })
      );
    }

    res.status(200).send({ orderId, message: "Order Placed" });
  } catch (error) {
    res.status(500).send(`${error.message}: Error while placing the Order`);
  }
});
/********************************************************************* */
app.get("/orders/:orderId", async (req, res) => {
  const orderId = req.params.orderId;
  try {
    const orderInfo = await getOrder(orderId);
    const cart = await getPizzaOrderInfo(orderId);
    const drinksCart = await getDrinkOrderInfo(orderId);
    res.status(200).json({
      orderInfo: orderInfo[0],
      cart: cart[0],
      drinksCart: drinksCart[0],
    });
  } catch (error) {
    res
      .status(500)
      .send(`${error.message}:Error while fetching the order info`);
  }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

/********************************************************************* */

app.get("/users/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await getUserInfoById(userId);
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(`${error.message}:Error while fetching the user info`);
  }
});
