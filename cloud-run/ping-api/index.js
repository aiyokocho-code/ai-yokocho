import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());

app.get('/', (req, res) => {
  res.json({ 
    status: "success",
    message: "Cloud Runへの接続成功！今、準備中や。",
    timestamp: new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
