// TODO útfæra proxy virkni
import fetch from 'node-fetch';
import {timerStart, timerEnd} from './time.js';
import {get, set} from './cache.js';
import express from 'express';


export const router = express.Router();


function generateTitle(period,type) {
    let period_str;
    let type_str;
    if(period === "hour"){
        period_str = "seinustu klukkustund";
    }else if(period == "day") {
        period_str === "seinasta dag";
    }else if (period === "week") {
        period_str = "seinustu viku";
    }else{
        period_str = "seinusta mánuð";
    }

    if(type === "significant") {
        type_str = "Verulegir jarðskjálftar, ";
    }else if(type === "all") {
        type_str = "Allir jarðskjálftar, ";
    }else {
        type_str = `${type}+ á richter jarðskjálftar`;
    }
    return type_str + period_str;
}



router.get('/proxy', async (req, res, next) => {
    const url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${req.query.type}_${req.query.period}.geojson`;
    const key = `${req.query.type}_${req.query.period}`;
    let result;
    let cache_timer = timerStart();
  
    result = await get(key);
    if (result) {
      const gogn = {
        title: result.title,
        data: result.data,
        info: {
          cached: true,
          elapsed: timerEnd(cache_timer),
        },
      };
      return res.json(gogn);
    }
    const fetch_timer = timerStart();
    try {
      result = await fetch(url);
    } catch (e) {
      return next();
    }
    const text = await result.text();
    const gogn = {
      title: generateTitle(req.query.period, req.query.type),
      data: JSON.parse(text),
      info: {
        cached: false,
        elapsed: timerEnd(fetch_timer),
      },
    };
    await set(key, gogn, 60);
    return res.json(gogn);
  });