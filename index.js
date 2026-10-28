import cors from "cors";
import "dotenv/config";
import express from "express";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
const mongoClient = await connectToMongoDB();
const db = mongoClient.db("wanderlust");
const destinationCollection = db.collection("destination");

app.get("/", (req, res) => {
  res.send({ message: "server running fine" });
});

app.post("/add-destination", async (req, res) => {
  const data = req.body;
  const result = await destinationCollection.insertOne(data);
  console.log(result);
  res.send(result);
});
app.get("/destination", async (req, res) => {
  const result = await destinationCollection.find().toArray();
  res.send(result);
});
// for details page
app.get("/destination/:id", async (req, res) => {
  const { id } = req.params;
  const result = await destinationCollection.findOne({ _id: new ObjectId(id) });
  console.log(id);
  res.send(result);
});

// update from the destination details edit page.
// _id comes back in req.body, and must not be overwritten.
app.put("/destination/:id", async (req, res) => {
  const { id } = req.params;
  const { _id, ...data } = req.body;
  const result = await destinationCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: data },
    { returnDocument: "after" },
  );
  res.send(result);
});

// delete from the destination details page.
app.delete("/destination/:id", async (req, res) => {
  const { id } = req.params;
  const result = await destinationCollection.findOneAndDelete({
    _id: new ObjectId(id),
  });
  res.send(result);
});

app.listen(PORT, () => {
  console.log(`server is running ${PORT}`);
});
