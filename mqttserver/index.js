
const Promise = require('bluebird');
const express = require('express')

const MqttHandler = require('./MqttHandler');
const CoffeeController = require('./controllers/CoffeeController');
const LampController = require('./controllers/LampController');

const app = express()
const port = process.env.MQTTSERVER_LISTENING_PORT;

app.log = function() {
  // in case I ever need this thing logging somewhere
  let msg = [...arguments].join(' ');
  console.log(msg);
};

(() => {
  async function start() {
    try {
      app.mqttHandler = new MqttHandler();
      await app.mqttHandler.initialize();

      // todo if more devices purchased: make loader that iterates over files in folder
      app.controllers = {
        coffee: new CoffeeController(app),
        lamp: new LampController(app)
      };

      app.get('/coffee', async (req, res) => {
        try {
          res.send('<h1>Agitation request received</h1>'); // ack first because method exceeds browser timeout
          await (app.controllers.coffee.agitateWater());
        }
        catch (err) {
          app.log('coffee error', err);
          res.status(500);
        }
      })

      app.get('/coffeeOff', async (req, res) => {
        try {
          await (app.controllers.coffee.setOff());
          res.send('<h1>Depowered coffee agitator manually.</h1>');
        }
        catch (err) {
          app.log('coffeeOff error', err);
          res.status(500);
        }
      })

      app.get('/lamp', async (req, res) => {
        try {
          await (app.controllers.lamp.toggleOnce());
          res.send('<h1>Lamp toggled.</h1>');
        }
        catch (err) {
          app.log('lamp error', err);
          res.status(500);
        }
      })

      app.get('/', function (req, res) {
        res.send('<h1>GET request to homepage</h1>')
      })

      app.listen(port, () => console.log(`IOT Server listening on port ${port}!`))
    }
    catch (err) {
      console.error(err);
      if (app.mqttHandler) await app.mqttHandler.teardown();
      process.exit(1);
    }
  }
  start();
})()
