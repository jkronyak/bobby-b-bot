import { quotes } from "./quotes.js";

const getRandomQuote = () => { 
    return quotes[(Math.floor(Math.random() * quotes.length))];
};

const secondsToTime = (e) => {
    const h = Math.floor(e / 3600).toString().padStart(2,'0'),
          m = Math.floor(e % 3600 / 60).toString().padStart(2,'0'),
          s = Math.floor(e % 60).toString().padStart(2,'0');
    
    return h + ':' + m + ':' + s;
    //return `${h}:${m}:${s}`;
}

export { 
    getRandomQuote,
    secondsToTime
};