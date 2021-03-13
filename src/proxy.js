// TODO útfæra proxy virkni
import fetch from 'node-fetch';
import {timerStart, timerEnd} from './time.js';
import {get, set} from './cache.js';
import express from 'express';


export const router = express.Router();


function generateTitle(period,type) {
    let period_str;
    let type_str;
    if(period == "hour"){
        period_str = "seinustu klukkustund";
    }else if(period == "day") {
        period_str == "seinasta dag";
    }else if (period =="week") {
        period_str = "seinusut viku";
    }else{
        period_str = "seinusta mánuð";
    }

    if(type == "significant") {
        type_str = "Verulegir jarðskjálftar, ";
    }else if(type=="all") {
        type_str = "Allir jarðskjálftar, ";
    }else {
        type_str = `${type}+ á richter jarðskjálftar`;
    }
    return type_str + period_str;
}

async function fetchData(req,res,next) {

    const cacheKey = `${req.query.type}-${req.query.period}`;
    let result;
    const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${req.query.type}_${req.query.period}.geojson";
    const cache_timer = timerStart();
    result = await get(cacheKey);
    if(result) {
        const gogn = {
            title: result.title,
            data: result.data,
            info: {
                cached: true,
                elapsed: timerEnd(cache_timer),
            }
        }
        return res.json(gogn);
    }
    const fetch_timer_start = timerStart();
    try{
        result = await fetch(url);
    }catch(e){
        return next();
    }
    const txt = await result.text();
    const gogn = {
        title: generateTitle(req.query.period,req.query.type),
        data: txt,
        info:{
            cached: false,
            elapsed: timerEnd(fetch_timer_start),
        }
    };
    set(cacheKey,txt,60);
    return res.json(gogn);
}

router.get('/proxy', fetchData);