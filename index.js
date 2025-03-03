const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");


// console.log(require('crypto').randomBytes(64).toString('hex'));

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// parse application/json
app.use(bodyParser.json())

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("Kết nối database thành công."))
    .catch((err) => console.error("Lỗi kết nối MongoDB:", err));

app.use(
    cors({
        origin: "*"
    })
)



const userSchema = new mongoose.Schema({
    Temperature: Number,
    Humidity: Number,
    Light: Number,
    SoilHumidity: Number,
    createAt: Date,
}, {
    timestamps: false
});

const SensorData = mongoose.model("SensorData", userSchema, "sensor_data");



app.get("/data", async (req, res) => {
  try {
    const {Temperature, Humidity, Light, SoilHumidity} = req.query;

    const data = {
      Temperature: parseFloat(Temperature), 
      Humidity: parseFloat(Humidity), 
      Light: parseFloat(Light), 
      SoilHumidity: parseFloat(SoilHumidity),
      createAt: new Date(Date.now())
    }

    console.log(data);

    res.json(data);

  } catch (error) {
    console.log(error);
  }
});


app.listen(port, () => {
    console.log("Đang chạy trên cổng: " + port);
})