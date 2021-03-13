// TODO útfæra proxy virkni
import fetch from 'node-fetch';
import express from 'express';
import { timerStart, timerEnd } from './time.js';
import { get, set } from './cache.js';

export const router = express.Router();

function generateTitle(period, type) {
  let periodSstr;
  let typeStr;
  if (period === 'hour') {
    periodSstr = 'seinustu klukkustund';
  } else if (period === 'day') {
    periodSstr = 'seinasta dag';
  } else if (period === 'week') {
    periodSstr = 'seinustu viku';
  } else {
    periodSstr = 'seinusta mánuð';
  }

  if (type === 'significant') {
    typeStr = 'Verulegir jarðskjálftar, ';
  } else if (type === 'all') {
    typeStr = 'Allir jarðskjálftar, ';
  } else {
    typeStr = `${type}+ á richter jarðskjálftar`;
  }
  return typeStr + periodSstr;
}

router.get('/proxy', async (req, res, next) => {
  const url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${req.query.type}_${req.query.period}.geojson`;
  const key = `${req.query.type}_${req.query.period}`;
  let result;
  const cacheTimer = timerStart();

  result = await get(key);
  if (result) {
    const gogn = {
      title: result.title,
      data: result.data,
      info: {
        cached: true,
        elapsed: timerEnd(cacheTimer),
      },
    };
    return res.json(gogn);
  }

  const fetchTimer = timerStart();
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
      elapsed: timerEnd(fetchTimer),
    },
  };
  await set(key, gogn, 60);
  return res.json(gogn);
});
