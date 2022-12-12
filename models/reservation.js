/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");
const Customer = require("./customer");

/** A reservation for a party */

class Reservation {
  constructor({ id, customerId, numGuests, startAt, notes }) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  get formattedStartAt() {
    return moment(this.startAt).format("MMMM Do YYYY, h:mm a");
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
      `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
      [customerId]
    );

    return results.rows.map((row) => new Reservation(row));
  }

  /****************************************************************************/
  async getCustomer() {
    return await Customer.get(this.customerId);
  }
  /****************************************************************************/

  /** Get a single reservation */
  static async get(id) {
    const result = await db.query(
      `SELECT id, 
      customer_id AS "customerId", 
      num_guests AS "numGuests", 
      start_at AS "startAt", 
      notes AS "notes" FROM reservations
      WHERE id = $1`,
      [id]
    );
    const reservation = result.rows[0];

    if (!reservation) {
      const err = new Error(`No such reservation: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Reservation(reservation);
  }

  /** Create or Update a reservation  */
  async save() {
    if (this.id === undefined) {
      // create a reservation
      const result = await db.query(
        `INSERT INTO reservations (customer_id, start_at, num_guests, notes)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [this.customerId, this.startAt, this.numGuests, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      // update an existing reservation
      await db.query(
        `UPDATE reservations 
      SET start_at = $1, num_guests = $2, notes = $3
      WHERE id = $4`,
        [this.startAt, this.numGuests, this.notes, this.id]
      );
    }
  }
}

module.exports = Reservation;
