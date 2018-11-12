var express = require('express');
var router = express.Router();
const sql = require('../db/mssql-db')

/* GET users listing. */

router.get('/getUsersData', async function (req, res, next) {
  await sql.query(`select name,state,password,userid,(select ','+access from User_Access_View where name=a.name for XML path('')) as access
  from User_Access_View as a
  group by name,state,password,userid`, function (erro1, recordsets, affected) {
    const data = recordsets[0]
    res.json(data)
  })
});

router.get('/getCustomersData', async function (req, res, next) {
  await sql.query(`select * from User_Access_View where access= 'user' `, function (erro1, recordsets, affected) {
    const data = recordsets[0]
    res.json(data)
  })
});

router.get('/banUser', async function (req, res, next) {
  const id = req.query.id
  const state=req.query.state
  if(state=='启用'){
    await sql.query(`update UserTest set state ='禁用' where id =${id}`,function(erro1,recordsets,affected){})
  }else if(state=='禁用'){
     await sql.query(`update UserTest set state ='启用' where id =${id}`,function(erro1,recordsets,affected){})
  }
  
  res.send(true)
})

router.get('/banUserList', async function (req, res, next) {
  const list = req.query.list
  list.forEach( async function(element){
    await sql.query(`update UserTest set state ='禁用' where id =${element}`,function(erro1,recordsets,affected){})
  });
  res.send(true)
})

router.get('/openUserList', async function (req, res, next) {
  const list = req.query.list
  list.forEach( async function(element){
    await sql.query(`update UserTest set state ='启用' where id =${element}`,function(erro1,recordsets,affected){})
  });
  res.send(true)
})

module.exports = router;
