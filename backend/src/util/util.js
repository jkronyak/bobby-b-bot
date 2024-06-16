import { quotes } from "./quotes.js";

const getRandomQuote = () => { 
    return quotes[(Math.floor(Math.random() * quotes.length))];
};

export { 
    getRandomQuote
};