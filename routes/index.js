import express from 'express';
export const router = express.Router();

/* GET home page */
router.get('/', function(req, res, next) {
    res.json({ "message: ": "Rss service is alive" })
});