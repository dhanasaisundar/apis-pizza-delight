import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

/* ****************************************************************** */
export async function getUser(username) {
  const [user] = await pool.query(
    `SELECT * FROM users WHERE name="${username}"`
  );
  return user[0];
}

/* ****************************************************************** */
export async function getPizzas() {
  const [pizzas] = await pool.query(`SELECT
  m.id AS pizzaId,
  m.name AS pizzaName,
  m.soldout,
  m.unitprice,
  m.imageUrl,
  JSON_ARRAYAGG(i.name) AS ingredients
FROM
  menu AS m
JOIN
  pizza_ingredient AS pi ON m.id = pi.pizza_id
JOIN
  ingredients AS i ON pi.ingredient_id = i.id
GROUP BY
  m.id, m.name, m.soldout, m.unitprice, m.imageUrl;
`);
  return pizzas;
}

/* ****************************************************************** */
export async function getDrinks() {
  const [drinks] = await pool.query(`SELECT 
  id AS drinkId,
  name,
  unitprice,
  quantity,
  soldout,
  imageUrl 
  FROM 
    drinks;
  `);
  return drinks;
}

/* ****************************************************************** */
export async function getPizzasById(id) {
  const [pizza] = await pool.query(`SELECT * FROM PIZZA WHERE ID = ?`, [id]);
  return pizza[0];
}

/* ****************************************************************** */
export async function createUser(name, password, phoneNo, address, email) {
  const [result] = await pool.query(
    `INSERT INTO users (name, password, phone_no, address, email) VALUES (?, ?, ?, ?,?)`,
    [name, password, phoneNo, address, email]
  );

  return result.insertId;
}

/* ****************************************************************** */
export async function createPizza(name, ingredients, price) {
  const [pizza] = await pool.query(
    "INSERT INTO PIZZA (name,ingredients,price) VALUES(?,?,?)",
    [name, ingredients, price]
  );
  return getPizzasById(pizza.insertId);
}

/* ****************************************************************** */
export async function createOrder(
  orderId,
  priority,
  priorityPrice,
  orderPrice
) {
  await pool.query(
    "INSERT INTO `order` (order_id, priority, priority_price, order_price) VALUES (?, ?, ?, ?)",
    [orderId, priority, priorityPrice, orderPrice]
  );
}

/* ****************************************************************** */
export async function getOrder(orderId) {
  const orderInfo = await pool.query(
    `select * from \`order\` where order_id="${orderId}";`
  );
  return orderInfo;
}

/* ****************************************************************** */
export async function getPizzaOrderInfo(orderId) {
  const cart = await pool.query(`
  SELECT 
  JSON_ARRAYAGG(
    JSON_OBJECT(
      'name', m.name,
      'pizzaId', p.pizzaId,
      'quantity', p.quantity,
      'totalPrice', p.total_price
    )
  ) AS pizzas
FROM 
  \`order\` o
JOIN 
  pizza_order p ON o.order_id = p.order_id
JOIN 
  menu m ON p.pizzaId = m.id
WHERE 
  o.order_id = "${orderId}";
`);

  return cart;
}

/* ****************************************************************** */
export async function getDrinkOrderInfo(orderId) {
  const drinksCart = await pool.query(`SELECT 
JSON_ARRAYAGG(
  JSON_OBJECT(
    'name', m.name,
    'drinkId', d.drinkId,
    'quantity', d.quantity,
    'totalPrice', d.total_price
  )
) AS drinks
FROM 
\`order\` o
JOIN 
drink_order d ON o.order_id = d.order_id
JOIN 
drinks m ON d.drinkId = m.id
WHERE 
o.order_id = "${orderId}";
`);
  return drinksCart;
}

/* ****************************************************************** */
export async function getIngredients(pizzaId) {
  const ingredients = await pool.query(`SELECT 
 i.name
FROM 
 ingredients i
JOIN 
 pizza_ingredient p ON p.ingredient_id = i.id
JOIN 
 menu m ON m.id = p.pizza_id
WHERE 
 p.pizza_id = ${pizzaId}; `);
  return ingredients;
}

/* ****************************************************************** */
export async function pizzaOrder(orderId, pizzaId, quantity, totalPrice) {
  await pool.query(
    "INSERT INTO `pizza_order` (order_id,pizzaId,quantity,total_price) VALUES (?,?,?,?)",
    [orderId, pizzaId, quantity, totalPrice]
  );
}

/* ****************************************************************** */
export async function drinkOrder(orderId, drinkId, quantity, totalPrice) {
  await pool.query(
    "INSERT INTO `drink_order` (order_id,drinkId,quantity,total_price) VALUES (?,?,?,?)",
    [orderId, drinkId, quantity, totalPrice]
  );
}

/* ****************************************************************** */
export async function getUserInfoById(userId) {
  const [user] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);
  return user[0];
}

/* ****************************************************************** */
