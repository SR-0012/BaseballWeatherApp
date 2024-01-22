import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import cors from 'cors';

const app = express();
const port = 8000;

app.use(cors()); 

const APP_ID = ''; //OpenWeatherMapから自分のAPIキーを入力

const venueCoordinates = {
    '甲子園': { lat:  34.721217, lon: 135.361656 ,parkdeg:170},
    'マツダスタジアム': { lat: 34.39183, lon: 132.484132,parkdeg:80},
    '横浜': { lat: 35.443223, lon: 139.6401,parkdeg:44},
    "東京ドーム":{lat:35.70564,lon:139.751891},
    '神宮': { lat: 35.674492, lon: 139.717076,parkdeg:44},
    'バンテリンドーム': { lat: 35.186008, lon: 136.9474},
    '那覇': { lat: 26.203462, lon: 127.673019,parkdeg:44},
    '北谷': { lat: 26.311726, lon: 127.758409},

    '京セラD大阪': { lat: 34.66928, lon: 135.476143},
    "ほっと神戸":{lat:34.680606,lon:135.073506},
    'ZOZOマリン': { lat: 35.645158, lon: 140.030831,parkdeg:4},
    'PayPayドーム': { lat: 33.595394, lon: 130.362123},
    '長崎': { lat:32.777065, lon:129.860645},
    '楽天モバイル': { lat: 38.256748, lon: 140.902676,parkdeg:4},
    'ベルーナドーム': { lat: 35.769015, lon: 139.420191},
    'エスコンF': { lat: 42.990506, lon:141.549292 },
    
  
};
app.get('/weather', async (req, res) => {
  const teamName = req.query.team;
  const date = req.query.date || new Date().toISOString().split('T')[0]; //デフォルトは今日の日付
  const scheduleUrl = `https://baseball.yahoo.co.jp/npb/schedule/?date=${date}`;//ここでdata=${date}をdate=2023-04-01のように日付変更可能
  let venueName = '';
  try {
    const scheduleResponse = await axios.get(scheduleUrl);
    const $ = cheerio.load(scheduleResponse.data);

    $(".bb-score__content").each(function () {
        const homeTeam = $(this).find(".bb-score__homeLogo").text().trim();
        const awayTeam = $(this).find(".bb-score__awayLogo").text().trim();
        console.log("homeTeam",homeTeam);
        console.log("awayTeam",awayTeam);
        if (homeTeam === teamName || awayTeam === teamName) {
          venueName = $(this).find(".bb-score__venue").text().trim();
          console.log("Found venueName:", venueName); 
          return false;
        }
      });
      
      if (!venueName || !venueCoordinates[venueName]) {
        console.log("Venue not found for team:", teamName); 
        return res.status(404).json({ error: 'Venue not found' });
      }
      
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${venueCoordinates[venueName].lat}&lon=${venueCoordinates[venueName].lon}&appid=${APP_ID}&units=metric`;

    const weatherResponse = await axios.get(weatherUrl);
    // res.json(weatherResponse.data);
    console.log("weatherResponse",weatherUrl);
    console.log("venueCoordinates[venueName].parkdeg,",venueCoordinates[venueName].parkdeg);
    res.json({ 
        parkdeg: venueCoordinates[venueName].parkdeg,
        venue: venueName,
        weather: weatherResponse.data 
      });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.toString() });
  }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
