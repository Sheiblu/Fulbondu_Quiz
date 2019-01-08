var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

router.use(function (req, res, next) {
    // var token = req.headers['x-access-token'];
    var token = global.config.token;
    if (token) {
        jwt.verify(token, global.config.secretKey,
            {
                algorithm: global.config.algorithm

            }, function (err, decoded) {
                if (err) {
                    let errordata = {
                        message: err.message,
                        expiredAt: err.expiredAt
                    };
                    res.render('login', { message: 'Timeout Login Fast' });
                }
                req.decoded = decoded;
                next();
            });
    } else {
        res.render('login', { message: 'Plz login Fast' });
    }
});

module.exports = router;