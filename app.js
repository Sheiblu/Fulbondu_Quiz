const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { connection } = require('./connection/connection');
const verifyToken = require('./jwt/verify/verifytoken');

global.config = require('./jwt/config/config');
const extInfo = require('./info/extInfo');
const port = process.env.PORT || 3000;

var point = 0;

const app = express();
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use('/api/v1', require('./api/v1'));


app.get(['/', '/index'], (req, res) => {
    if (global.config.token !== undefined) {
        return res.redirect('home');
    }
    return res.render('index');
});

app.get('/login', (req, res) => {
    if (global.config.token === undefined) {
        return res.render('login', { message: "" });
    }
    return res.redirect('home');
});

app.post('/login', (req, res) => {
    let studentdata = {
        phone: req.body.phone,
        password: req.body.password
    }
    console.log("run : ");
    try {
        if (!connection) {
            connection.connect((err) => {
                res.render('error');
            });
        }


        connection.query(`Select Student_id from student where Mobile = ${studentdata.phone} and Password = '${studentdata.password}'`, (err, result, fields) => {
            if (err) {
                res.send({ "a": `Select Student_id from student where Mobile = ${studentdata.phone} and Password = '${studentdata.password}'` });
            }

            if (result.length > 0) {
                let token = jwt.sign(studentdata, global.config.secretKey, {
                    algorithm: global.config.algorithm,
                    expiresIn: '50m'
                });

                global.config.token = token;
                global.config.student_id = result[0].Student_id;
                console.log(token);
                res.redirect('home');
            } else {
                console.log("Phone or password not ");
                res.render('login');
            }
        });

    } catch (error) {
        return res.render('error');
    }
});


app.get('/logout', verifyToken, (req, res) => {
    global.config.token = undefined;
    res.redirect('/');
});



//  -------------- Home ----------

app.post('/home', verifyToken, (req, res) => {
    console.log(" Home post");
    try {
        if (!connection) {
            connection.connect((err) => {
                console.log("Connection check");
                if (err) {
                    return res.render('error');
                }
            });
            point++;
        }

        connection.query(`Select * from score_table where Player_id = 1`, (err, result, fields) => {
            if (err) {
                return res.render('error', err);
            }
            res.render('home', {
                score: result['0']
            });
        });

    } catch (error) {
        console.log("catch call", error);
    }
});

app.get('/home', verifyToken, (req, res) => {
    console.log(" Home Get");
    try {
        if (!connection) {
            connection.connect((err) => {
                console.log("Connection check");
                if (err) {
                    return res.render('error');
                }
            });
            point++;
        }

        connection.query(`Select * from score_table where Player_id = ${global.config.student_id}`, (err, result, fields) => {
            if (err) {
                return res.render('error', err);
            }
            res.render('home', {
                score: result['0']
            });
        });

    } catch (error) {
        console.log("catch call", error);
    }
});

//  -------  registration  ---------

app.get('/registration', (req, res) => {
    if (global.config.token === undefined) {
        return res.render('registration',
            { message: "" });
    }
    return res.redirect('home');
});




app.post('/registration', (req, res) => {

    if (global.config.token === undefined) {

        let studentInfo = {
            name: req.body.name,
            school: req.body.school,
            class: req.body.St_class,
            roll: req.body.roll,
            zila: extInfo.ZilaAndUpozila[req.body.zila].name,
            upozila: extInfo.ZilaAndUpozila[req.body.zila].models[req.body.upozila],
            birthday: req.body.birthday,
            phone: req.body.phone,
            password: req.body.password
        }

        try {
            if (!connection) {
                connection.connect((err) => {
                    console.log("Connection check");
                    if (err) {
                        return res.render('error');
                    }
                });
                point++;
            }

            connection.query(`select * from student where  Mobile =  '${studentInfo.phone}'`, (err3, result3, fields3) => {
                if (err3) {
                    return res.send(err);
                }

                if (result3.length > 0) {
                    console.log("Connection check pass");

                    return res.render('registration', {
                        message: "Registration Fail as Mobile number Already Use"
                    });
                }



                // Create Student Account
                connection.query(`INSERT INTO student (Student_name, School , Class, Roll, Zela, UpoZela, Birthday, Mobile , Password ) VALUES ('${studentInfo.name}', '${studentInfo.school}', '${studentInfo.class}','${studentInfo.roll}','${studentInfo.zila}','${studentInfo.upozila}', '${studentInfo.birthday}', '${studentInfo.phone}', '${studentInfo.password}')`, (err, result, fields) => {
                    if (err) {
                        return res.send(err);
                    }

                    let insertId = result.insertId;
                    console.log("Score Stard");

                    // Create Scor table Account
                    connection.query(`INSERT INTO score_table ( Player_id ) VALUES ('${insertId}')`, (err2, result2, fields) => {

                        if (err2) {
                            return res.send(err2);

                        } else if (result2.insertId !== undefined) {
                            return res.render('registration',
                                { message: "Registration Successfull" });
                        } else {
                            return res.render('registration',
                                { message: "Registration Fail Try Again" });
                        }
                    });
                });
            });

        } catch (error) {
            console.log("catch call", error);
        }
    } else {
        return res.redirect('home');
    }

});


//  --------- Condition  -------
app.get('/condition', (req, res) => {
    if (global.config.token === undefined) {
        return res.render('condition');
    }
    res.redirect('home');
});



// ----------   Quiz -----------

app.post('/quiz', verifyToken, (req, res) => {

    let roundId = req.body.roundId;
    let number_of_playing = "R" + roundId + "_number_of_playing";
    let playing_time = "R" + roundId + "_last_play_time";

    if (roundId < 1 || roundId > 7) {
        return res.render('error');
    }

    console.log(point);
    try {
        if (!connection) {
            connection.connect((err) => {
                console.log("Connection check");
                if (err) {
                    return res.send(err);
                }
            });
            point++;
        }

        // get question from Db
        connection.query(`Select * from ${extInfo.dbTableName[roundId]} ORDER BY RAND() LIMIT 10`, (err, result, fields) => {
            if (err) {
                return res.render('error', err);
            }

            // Incress _number_of_playing in Db
            connection.query(`UPDATE score_table  SET ${number_of_playing} = ${number_of_playing} + 1 , ${playing_time} = current_timestamp WHERE Player_id = ${global.config.student_id}`, (err, result, fields) => {
                if (err) {
                    return res.render('error', err);
                }
            });

            res.render('quiz', {
                questions: result,
                round: extInfo.roundName[roundId],
                step: roundId,
                number: extInfo.number
            });
        });

    } catch (error) {
        console.log("catch call", error);
    }
});



// ------- Question answer  -----------  

app.post('/answer', (req, res) => {

    let roundId = req.body.step;
    let player_previour_currect = "R" + roundId + "_currect_answer ";
    let previous_playing_time = "R" + roundId + "_time";

    let nextround = parseInt(roundId) + 1;
    let NextRoundinfo = {
        this_round_number_playing: "R" + roundId + "_number_of_playing",
        this_round_currect_answer: "R" + roundId + "_currect_answer",
        previous_round_number_playing: "R" + nextround + "_number_of_playing",
        previous_round_currect_answer: "R" + nextround + "_currect_answer"
    }


    if (roundId < 1 || roundId > 7) {
        return res.render('error');
    }

    console.log(req.body.time);
    let questionAnswer = extInfo.data(req);

    //Sort array
    questionAnswer.sort(function (a, b) { return a.Q - b.Q });

    let question = [];
    for (i in questionAnswer) {
        question.push(questionAnswer[i].Q);
    }

    try {
        if (!connection) {
            connection.connect((err) => {
                console.log("Connection check Connect");
                if (err) {
                    return res.render('error');
                }
            });
            point++;
        }


        connection.query(`Select * from ${extInfo.dbTableName[roundId]} where Id IN (${question})`, (err, result, fields) => {
            let finalResult = [];
            let finalMark = 0;
            let rightAnswer = 0;


            if (err) {
                return res.render('error', err);
            }

            for (i in result) {
                if (result[i].Question_answer == questionAnswer[i].A) {
                    finalResult[i] = "আপনার উত্তর সঠিক হয়েছে ।";
                    rightAnswer++;
                } else {
                    finalResult[i] = "আপনি ভুল উত্তর দিয়েছেন ।";
                }
            }

            finalMark = (rightAnswer * 5) + (req.body.time / 6000);
            console.log("Final Mark" + finalMark);
            console.log("Final time" + (req.body.time / 6000));

            connection.query(`Select * from score_table where Player_id = ${global.config.student_id}`, (err1, data, fields1) => {
                if (err) {
                    return res.render('error', err);
                }

                for (i in data) {
                    NextRoundinfo.this_round_currect_answer = data[i][`${NextRoundinfo.this_round_currect_answer}`];
                    NextRoundinfo.this_round_number_playing = data[i][`${NextRoundinfo.this_round_number_playing}`];
                    NextRoundinfo.previous_round_currect_answer = data[i][`${NextRoundinfo.previous_round_currect_answer}`],
                        NextRoundinfo.previous_round_number_playing = data[i][`${NextRoundinfo.previous_round_number_playing}`];
                }

                if (roundId == 7) {
                    NextRoundinfo.previous_round_currect_answer = -1,
                        NextRoundinfo.previous_round_number_playing = 5;
                }

                console.log(data[0]["R" + roundId + "_time"]);



                if (data[0]["R" + roundId + "_currect_answer"] < rightAnswer) {

                    connection.query(`UPDATE score_table  SET ${player_previour_currect} = ${rightAnswer}, ${previous_playing_time} = ${req.body.time} where Player_id = ${global.config.student_id}`, (err1, data2, fields1) => {
                        if (err) {
                            return res.render('error', err);
                        }
                        console.log("Upload result");

                        NextRoundinfo.this_round_currect_answer = rightAnswer;


                        let round2 = parseInt(roundId) + 1;
                        if (roundId !== 7 && rightAnswer > 3 && data[0]["R" + round2 + "_currect_answer"] < 0) {

                            NextRoundinfo.previous_round_currect_answer = 0,
                                NextRoundinfo.previous_round_number_playing = 0;
                            let player_update_result = "R" + round2 + "_currect_answer";

                            connection.query(`UPDATE score_table  SET ${player_update_result} = 0 where Player_id = ${global.config.student_id}`, (err1, data, fields1) => {
                                if (err) {
                                    return res.render('error', err);
                                }
                                console.log("New Round Open result");
                            });
                        }
                        console.log("before concole NextRoundinfo");
                        console.log(NextRoundinfo);




                        res.render('answer', {
                            questions: result,                // question + result + all info
                            round: extInfo.roundName[roundId],  // Round name in bangla
                            roundId: roundId,             // playing round
                            studentAnswer: questionAnswer,
                            finalResult: finalResult,  //  উত্তর সঠিক  or Wrong
                            rightAnswer,             //  Number of right answer given the student
                            number: extInfo.number,  // Show Bangla 1 , 2, 3
                            NextRoundinfo: NextRoundinfo,
                            finalMark: Number.parseFloat(finalMark).toFixed(2)  // score
                        });

                    });

                } else {

                    res.render('answer', {
                        questions: result,                // question + result + all info
                        round: extInfo.roundName[roundId],  // Round name in bangla
                        roundId: roundId,             // playing round
                        studentAnswer: questionAnswer,
                        finalResult: finalResult,  //  উত্তর সঠিক  or Wrong
                        rightAnswer,             //  Number of right answer given the student
                        number: extInfo.number,  // Show Bangla 1 , 2, 3
                        NextRoundinfo: NextRoundinfo,
                        finalMark: Number.parseFloat(finalMark).toFixed(2)  // score

                    });
                }
            });
        });
    } catch (error) {
        console.log("catch call", error);
    }
});


app.get('*', (req, res) => {
    res.render('error');
});

app.listen(port, () => {
    console.log('Server in on Port 3000');
});