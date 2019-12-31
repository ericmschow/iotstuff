const AbstractController = require('./AbstractController');

module.exports = new class CoffeeController extends AbstractController {
  constructor(app) {
    this.app = app;
    this.topic = 'coffee';
    this.millisecondsToStayEngaged = 1000 * 60 * 5; // 5 minutes
  }

  agitateWater() {
    await this.setOn();
    await Promise.delay(this.millisecondsToStayEngaged);
    await this.setOff();
  }
}
