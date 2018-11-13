var express = require('express');
var router = express.Router();
const sql = require('../db/mssql-db')
// mssql安装最新版本的话有些方法就会报错mssql.Connection is not a constructor
/* GET home page. */

router.post('/login', async function (req, res, next) {
  const name = req.body.userName
  const pwd = req.body.password
  const session = req.session;
  await sql.query(`select * from User_Access_View where name='${name}'`, function (error, recordsets, affected) {
    let jso = recordsets[0][0]
    if (jso == null || jso == undefined || jso['state'] == '禁用') {
      res.send({ "token": null })
    }
    else {
      let password = jso['password']
      if (password == pwd) {
        let access = [];
        recordsets[0].forEach(element => {
          access.push(element.access)
        })
        let user = { 'name': name, 'pwd': pwd ,'access':access}
        session.user = user;
        res.send({
          "code": 200,
          "token": `${name}`
        })
      } else {
        res.send({ "token": null })
      }
    }
  })
})

router.post('/register', async function (req, res, next) {
  const name = req.body.userName
  const pwd = req.body.password
  await sql.query(`insert into UserTest (name,password) values (${name},${pwd})`, function (error, recordsets, affected) {
    res.send(true)
  })
})

router.get('/gettoken', async function (req, res, next) {
  let token = req.query.token
  if (token != "null" && token != '' && token != undefined) {
    await sql.query(`select * from User_Access_View where name='${token}'`, function (error, recordsets, affected) {
      let data = recordsets[0]
      let access = [];
      data.forEach(element => {
        access.push(element.access)
      });
      res.send({
        "code": 200,
        "access": access,
        "avator": "https://file.iviewui.com/dist/a0e88e83800f138b94d2414621bd9704.png",
        "user_id": recordsets[0][0]['userid'],
        "user_name": recordsets[0][0]['name']
      })
    })
  }
  else {
    res.send(null)
  }


})

router.post('/logout', function (req, res, next) {
  let token = null
  req.session.user = null
  res.send(token)
})

router.get('/getTableData', async function (req, res, next) {
  await sql.query(`select * from TableTest`, function (erro1, recordsets, affected) {
    const data = recordsets[0]
    res.json(data)
  })
})

router.get('/deleteTableData', async function (req, res, next) {
  const id = req.query.id
  await sql.query(`delete from TableTest where id =${id}`, function (erro1, recordsets, affected) { })
  res.send(true)
})

router.get('/deleteTableList', async function (req, res, next) {
  const list = req.query.list

  list.forEach(async function (element) {
    await sql.query(`delete from TableTest where id =${element}`, function (erro1, recordsets, affected) { })
  });
  res.send(true)
})

router.get('/GetList', async function (req, res, next) {
  await sql.query(`select * from TableTest`, function (erro1, recordsets, affected) {
    const data = recordsets[0]
    res.send(data)
  })
})

module.exports = router;
