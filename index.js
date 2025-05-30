const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;


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



const sensorSchema = new mongoose.Schema({
  Temperature: Number,
  Humidity: Number,
  Light: Number,
  SoilHumidity: Number,
  createAt: Date,
}, {
  timestamps: false
});

const SensorData = mongoose.model("SensorData", sensorSchema, "sensor_data");

const waterVolumn = new mongoose.Schema({
  volumn: Number,
  createAt: Date,
}, {
  timestamps: false
});

const WaterVolumn = mongoose.model("WaterVolumn", waterVolumn, "water_volumn");


// const sensorSchema = new mongoose.Schema({
//   Temperature: Number,
//   Humidity: Number,
//   Light: Number,
//   SoilHumidity: Number,
//   createAt: Date,
// }, {
//   timestamps: false
// });

// const SensorData = mongoose.model("SensorData", sensorSchema, "sensor_data");



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

    const saveData = new SensorData(data);
    await saveData.save();

    res.json("Lấy data thành công");

  } catch (error) {
    console.log(error);
  }
});

app.get("/export-data", async(req, res) => {
  try {
    const filePath = "sensor_data.csv";
    const data = await SensorData.find();

    const dataFormat = data.map(item => {
      const itemObject = item.toObject();
      itemObject.SoilHumidity = 100-(item.SoilHumidity/4095*100);
      const date = new Date(item.createAt);
      itemObject.time = date.toLocaleString("vi-VN", {timeZone: "Asia/Ho_Chi_Minh"});
      return itemObject;
    })
  
    const csvWriter = createCsvWriter({
      path: filePath,
      header: [
        { id: "Temperature", title: "temperature" },
        { id: "Humidity", title: "humidity" },
        { id: "SoilHumidity", title: "soilhumidity" },
        { id: "Light", title: "light" },
        { id: "time", title: "time" },
      ],
    })

    try {
      await csvWriter.writeRecords(dataFormat);
      console.log("Xuất file CSV thành công!");
  
      // Trả về file CSV cho client tải về
      res.download(filePath, "data.csv", (err) => {
        if (err) {
          console.error("Lỗi khi tải file:", err);
          res.status(500).send("Lỗi khi tải file.");
        }
      });
    } catch (error) {
      console.error("Lỗi xuất CSV:", error);
      res.status(500).send("Lỗi khi xuất file CSV.");
    }
  } catch (error) {
    console.log(error)
  }
})

app.get("/get-data", async(req, res) => {
  try {
    const data = await SensorData.find();
    const count = await SensorData.countDocuments();
    const tempObject = [];
    const humObject = [];
    const lightObject = [];
    const soildObject = [];
    const dataFormat = data.map(item => {
      const itemObject = item.toObject();
      const date = new Date(item.createAt);
      itemObject.time = date.toLocaleString("vi-VN", {timeZone: "Asia/Ho_Chi_Minh"});
      return itemObject;
    })
    for (const item of dataFormat) {
      tempObject.push({type: "Temperature", value: item.Temperature, time: item.time});
      humObject.push({type: "Humidity", value: item.Humidity, time: item.time});
      lightObject.push({type: "Light", value: item.Light, time: item.time});
      soildObject.push({type: "SoilHumidity", value: item.SoilHumidity, time: item.time});
    }
    
    res.json({dataTempHumid: [...tempObject, ...humObject], dataLightSoild: [...lightObject, ...soildObject]});
  } catch (error) {
    console.log(error);
  }
})

app.get("/get-data-2", async(req, res) => {
  try {
    const data = await SensorData.find();
    const count = await SensorData.countDocuments();
    const tempObject = [];
    const humObject = [];
    const lightObject = [];
    const soildObject = [];
    // const dataFormat = data.map(item => {
    //   const itemObject = item.toObject();
    //   const date = new Date(item.createAt);
    //   itemObject.time = date.toLocaleString("vi-VN", {timeZone: "Asia/Ho_Chi_Minh"});
    //   return itemObject;
    // })
    for (const item of data) {
      const date = new Date(item.createAt);
      const time = date.toLocaleString("vi-VN", {timeZone: "Asia/Ho_Chi_Minh"});
      item["time"] = time;
    }
    for (const item of data) {
      tempObject.push({value: item.Temperature, time: item.time});
      humObject.push({value: item.Humidity, time: item.time});
      lightObject.push({value: item.Light, time: item.time});
      soildObject.push({value: item.SoilHumidity, time: item.time});
    }

    res.json({Temprature: [...tempObject], Humidity: [...humObject], Light: [...lightObject], SoilHumidity: [...soildObject]});
  } catch (error) {
    console.log(error);
  }
})

app.get("/get-data-3", async(req, res) => {
  try {
    const data = await SensorData.find();
    const count = await SensorData.countDocuments();
    const tempObject = [];
    const humObject = [];
    const lightObject = [];
    const soildObject = [];
    const timeObject = [];

    for (const item of data) {
      const date = new Date(item.createAt);
      const time = date.toLocaleString("vi-VN", {timeZone: "Asia/Ho_Chi_Minh"});
      item["time"] = time;
    }
    for (const item of data) {
      tempObject.push(item.Temperature);
      humObject.push(item.Humidity);
      lightObject.push(item.Light);
      soildObject.push(100-(item.SoilHumidity/4095*100));
      timeObject.push(item.time);
    }

    return res.json({Temprature: [...tempObject], Humidity: [...humObject], Light: [...lightObject], SoilHumidity: [...soildObject], Time: [...timeObject]});
  } catch (error) {
    console.log(error);
    return res.status(500).json("Loi: " + error);
  }
})

app.get("/get-newest-record", async(req, res) => {
  try {
    const data = await SensorData.find().sort({createAt: -1}).limit(1).select("-_id -__v");

    const date = new Date(data[0].createAt);

    const time = date.toLocaleString("vi-VN", {timeZone: "Asia/Ho_Chi_Minh"});

    const record = data[0].toObject();

    record["createAt"] = time;

    return res.json(record);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Loi: " + error);
  }
})


// --------------------------------------------
app.get("/get-water-volumn", async(req, res) => {
  try {
    const {volumn} = req.query;

    

    const newRecord = new WaterVolumn({
      volumn: volumn,
      createAt: new Date(Date.now() + 7 * 60 * 60 * 1000)
    });
    await newRecord.save();
    return res.status(200).json("Đã lưu dữ liệu tưới nước");
  } catch (error) {
    console.log(error);
    return res.status(500).json("")
  }
})

app.get("/get-data-water-volumn", async(req, res) => {
  try {
    const datas = await WaterVolumn.find();
    const waterVolumnObject = [];
    const timeObjects = [];
    for (const item of datas) {
      waterVolumnObject.push(item.volumn);
      timeObjects.push(item.createAt.toLocaleString());
    }
    return res.status(200).json({waterVolumn: [...waterVolumnObject], time: [...timeObjects]});
  } catch (error) {
    console.log(error);
    return res.status(500).json("error: " + error);
  }
})


app.get("/get-newest-record-water", async(req, res) => {
  try {
    const data = await WaterVolumn.find().sort({createAt: -1}).limit(1).select("-_id -__v");

    const date = new Date(data[0].createAt);

    const time = date.toLocaleString();

    const record = data[0].toObject();

    record["createAt"] = time;

    return res.json(record);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Loi: " + error);
  }
})
// --------------------------------------------


app.listen(port, () => {
    console.log("Đang chạy trên cổng: " + port);
})