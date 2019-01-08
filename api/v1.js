const express = require('express');
const router = express.Router();
const mysql = require('mysql');


var error  = ["error", "error", "error"];

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "fulbondhu"
});


router.get('/login?', (req , res) => {
    var studentdata = {
        phone : req.query.phone,
        password : req.query.password
    }  

    
    connection.query(`Select Student_id from student where Mobile = ${studentdata.phone} and Password = ${studentdata.password}`, (err, result, fields) => {
        if (err) {
            console.log("error");
             res.send(error);
        } else if (result.length < 1){ 
            console.log("error");
             res.send(err);
        } 

        return res.send(result);

        let Student_id = result[0].Student_id ;
        
        connection.query(`SELECT * FROM score_table where Player_id  = ${Student_id}`, (err1, result1, fields1) => {
            if(err1){
                 res.send(err1);
            } else if (result1.length < 1){
                  res.send(error);
            }
             res.send(result1);
         });
    });
});


router.post('/registration', (req , res) => {  

    let newStudent = { 
        student_name : req.body['student_name'],
        student_school  : req.body.student_school,
        student_class  : req.body.student_class,
        student_roll  : req.body.student_roll,
        student_district  : req.body.student_district,
        student_thana  : req.body.student_thana,
        student_phone  : req.body.student_phone,
        student_password  : req.body.student_password,
        student_birthday  : req.body.student_birthday
    }

    connection.query(`SELECT * FROM student where Mobile  = ${newStudent.student_phone}`, (err, result , fields) => {
        if(err) {
            return res.send("Server Error");
        } else if (result.length > 0) {
            return res.send("wrong phone");
        }


        connection.query(`INSERT INTO student (Student_name, School , Class, Roll, Zela, UpoZela, Birthday, Mobile , Password ) VALUES ('${newStudent.student_name}', '${newStudent.student_school}', '${newStudent.student_class}', '${newStudent.student_roll}' , '${newStudent.student_district}', '${newStudent.student_thana}', '${newStudent.student_birthday}', '${newStudent.student_phone}', '${newStudent.student_password}')`, (err1, result1, fields1) => {
            if(err1) {
                return res.send(error);
            } else if (result1.length > 0) {
                return res.send("wrong phone");
            }

            let insertId = result1.insertId;
             

  // Create Score table Account
             connection.query(`INSERT INTO score_table ( Player_id ) VALUES ('${insertId}')`, (err2, result2, fields) => {
                  
                if (err2) {
                    return res.send(err2);
                }
                
                return  res.send("Registration Successful");
            });
        })
    });

});


router.get('*', (req , res) => {
    res.send({"info" : "Nothing Found"});
});


module.exports = router ;