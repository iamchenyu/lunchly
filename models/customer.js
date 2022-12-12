/** Customer for Lunchly */

const db = require("../db");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
  }

  get fullName() {
    return this.firstName + " " + this.lastName;
  }

  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes
       FROM customers
       ORDER BY last_name, first_name`
    );
    return results.rows.map((c) => new Customer(c));
  }

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes 
        FROM customers WHERE id = $1`,
      [id]
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }
    return new Customer(customer);
  }

  /** Search customers */

  static async search(term) {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes
       FROM customers
       WHERE first_name ILIKE $1 OR last_name ILIKE $1`,
      [`%${term}%`]
    );
    return results.rows.map((c) => new Customer(c));
  }

  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. (no need to return anything) */

  async save() {
    if (this.id === undefined) {
      // create a new customer (Customer instance should already be created beforehand)
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      // update an existing customer
      await db.query(
        `UPDATE customers SET first_name=$1, last_name=$2, phone=$3, notes=$4
             WHERE id=$5`,
        [this.firstName, this.lastName, this.phone, this.notes, this.id]
      );
    }
  }

  /** Get top 10 customers */
  static async getTopTen() {
    const results = await db.query(
      `SELECT customer_id, COUNT(customer_id) AS total FROM reservations
      GROUP BY customer_id
      ORDER BY total DESC
      LIMIT 10`
    );
    return Promise.all(
      results.rows.map(async (re) => {
        const customer = await this.get(re.customer_id);
        return { customer, reservations: re.total };
      })
    ).then((data) => data);
  }
}

module.exports = Customer;

// To solve the circular dependency:
// Reference: https://stackoverflow.com/questions/10869276/how-to-deal-with-cyclic-dependencies-in-node-js
const Reservation = require("./reservation");
