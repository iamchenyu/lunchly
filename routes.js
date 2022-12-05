/** Routes for Lunchly */

const express = require("express");

const Customer = require("./models/customer");
const Reservation = require("./models/reservation");

const router = new express.Router();

/** Homepage: show list of customers. */

router.get("/", async function (req, res, next) {
  try {
    const customers = await Customer.all();
    return res.render("customer_list.html", { customers });
  } catch (err) {
    return next(err);
  }
});

/** Form to add a new customer. */

router.get("/add", async function (req, res, next) {
  try {
    return res.render("customer_new_form.html");
  } catch (err) {
    return next(err);
  }
});

/** Handle adding a new customer. */

router.post("/add", async function (req, res, next) {
  try {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const phone = req.body.phone;
    const notes = req.body.notes;

    const customer = new Customer({ firstName, lastName, phone, notes });
    console.log(customer);
    console.log(customer.firstName);
    console.log(customer.validatedFirstName);

    await customer.save();

    return res.redirect(`/${customer.id}/`);
  } catch (err) {
    return next(err);
  }
});

/** Handle get top 10 customers */
router.get("/top-customers", async (req, res, next) => {
  try {
    const pairs = await Customer.getTopTen();
    return res.render("top_10_customers.html", { pairs });
  } catch (e) {
    return next(e);
  }
});

/** Handle search a customer */
router.get("/search", (req, res, next) => {
  try {
    return res.render("search.html");
  } catch (e) {
    return next(e);
  }
});

router.post("/search", async (req, res, next) => {
  try {
    const { searchTerm } = req.body;
    const results = await Customer.search(searchTerm);
    return res.json(results);
  } catch (e) {
    return next(e);
  }
});

/****************************************************************************/
// router.get("/reservations/:id", async (req, res, next) => {
//   const reservation = await Reservation.get(req.params.id);
//   const customer = reservation.getCustomer();
//   console.log(customer);
// });
/****************************************************************************/

/** Show a customer, given their ID. */

router.get("/:id", async function (req, res, next) {
  try {
    const customer = await Customer.get(req.params.id);

    const reservations = await customer.getReservations();

    return res.render("customer_detail.html", { customer, reservations });
  } catch (err) {
    return next(err);
  }
});

/** Show form to edit a customer. */

router.get("/:id/edit", async function (req, res, next) {
  try {
    const customer = await Customer.get(req.params.id);

    res.render("customer_edit_form.html", { customer });
  } catch (err) {
    return next(err);
  }
});

/** Handle editing a customer. */

router.post("/:id/edit", async function (req, res, next) {
  try {
    const customer = await Customer.get(req.params.id);
    customer.firstName = req.body.firstName;
    customer.lastName = req.body.lastName;
    customer.phone = req.body.phone;
    customer.notes = req.body.notes;
    await customer.save();

    return res.redirect(`/${customer.id}/`);
  } catch (err) {
    return next(err);
  }
});

/** Handle adding a new reservation. */

router.post("/:id/add-reservation", async function (req, res, next) {
  try {
    const customerId = req.params.id;
    const startAt = req.body.startAt;
    const numGuests = req.body.numGuests;
    const notes = req.body.notes;

    const reservation = new Reservation({
      customerId,
      startAt,
      numGuests,
      notes,
    });
    await reservation.save();

    return res.redirect(`/${customerId}/`);
  } catch (err) {
    return next(err);
  }
});

/** Handle edit a reservation */
router.get(
  "/:customerId/:reservationId/edit-reservation",
  async (req, res, next) => {
    try {
      const reservation = await Reservation.get(req.params.reservationId);
      const customer = await Customer.get(req.params.customerId);
      return res.render("reservation_edit_form.html", {
        reservation,
        customer,
      });
    } catch (e) {
      return next(e);
    }
  }
);

router.post(
  "/:customerId/:reservationId/edit-reservation",
  async (req, res, next) => {
    try {
      const id = req.params.reservationId;
      const reservation = await Reservation.get(id);
      reservation.startAt = req.body.startAt;
      reservation.numGuests = req.body.numGuests;
      reservation.notes = req.body.notes;
      await reservation.save();

      return res.redirect(`/${reservation.customerId}/`);
    } catch (e) {
      return next(e);
    }
  }
);

module.exports = router;
