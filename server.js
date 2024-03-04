const express = require("express");
const bodyParser = require("body-parser");
const stripe = require("stripe")(
  "sk_test_51OeyAHGJXmbOjm9aUeIevl58VgYJ05NNzplNH568iaGdNJx6smzCnsFIJDaxdpnvbLh8vMlZ4exTAwzu5RtJ0JQo00LCZUq8UV"
);

const fs = require("fs");

const app = express();
const http = require("http");
const { Server } = require("socket.io");

const expressPort = 3011;
const socketIOPort = 3012;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const webhookSecret = "whsec_382cb8481ef38e949b03015feea03145a8bf9c0d2c379ffb29ffb2e007c40d78";


let completedSessions = [];

console.log(completedSessions);

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.emit('message', { message: 'Üdvözöljük a WebSocketen!' });

  // Olvassa be a completedSessions fájlt és küldje el a kliensnek
  try {
    const data = fs.readFileSync("completedSessions.json", "utf8");
    const completedSessions = JSON.parse(data);
    socket.emit('completedSessions', { completedSessions });
    console.log('Összes completed session betöltve:', completedSessions);
  } catch (err) {
    console.error('Hiba a completedSessions fájl olvasásakor:', err.message);
  }

  socket.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Use body-parser middleware to parse the raw body as text
app.use(bodyParser.raw({ type: "application/json" }));

// CORS setup (you may need to adjust this based on your requirements)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    // Use the Stripe SDK to construct the event
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`❌ Error message: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Successfully constructed event.
  console.log("✅ Success:", event.id);

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent status: ${paymentIntent.status}`);
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      console.log(
        `❌ Payment failed: ${paymentIntent.last_payment_error?.message}`
      );
      break;
    }
    case "charge.succeeded": {
      const charge = event.data.object;
      console.log(`Charge id: ${charge.id}`);
      break;
    }
    case "checkout.session.completed": {
      const session = event.data.object;
      const sessionId = session.id;
      const sessionEmail = session.customer_details.email;

      // Olvassa be a completedSessions fájlt
      try {
        const data = fs.readFileSync("completedSessions.json", "utf8");
        const completedSessions = JSON.parse(data);

        // Hozzáadja az új completed session-t
        completedSessions.push({ sessionId, sessionEmail });

        // Az új completedSessions-t írja ki a fájlba
        fs.writeFileSync("completedSessions.json", JSON.stringify(completedSessions), (err) => {
          if (err) {
            console.error('Hiba a completedSessions fájl írásakor:', err.message);
          } else {
            console.log('completedSessions fájl frissítve:', completedSessions);
          }
        });

        console.log('Összes completed session:', completedSessions);
      } catch (err) {
        console.error('Hiba a completedSessions fájl olvasásakor:', err.message);
      }

      break;
    }
    default: {
      console.warn(`Unhandled event type: ${event.type}`);
      break;
    }
  }

  // Return a response to acknowledge receipt of the event.
  res.json({ received: true });
});

app.listen(expressPort, () => {
  console.log(`Express is running on port ${expressPort}`);
});

server.listen(socketIOPort, () => {
  console.log(`Server is running on port ${socketIOPort}`);
});
