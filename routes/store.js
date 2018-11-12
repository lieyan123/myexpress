var express = require('express');
var router = express.Router();
const sql = require('../db/mssql-db')

router.get('/getStore', async function (req, res, next) {
  await sql.query(`select * from Store_View`, function (erro1, recordsets, affected) {
    const data = recordsets[0]
    res.json(data)
  })
});

router.get('/getProduct', async function (req, res, next) {
  await sql.query(`select *,0 as number from Product`, function (erro1, recordsets, affected) {
    const data = recordsets[0]
    res.json(data)
  })
});

router.get('/getSuppliersData', async function (req, res, next) {
  await sql.query(`select * from Supplier`, function (erro1, recordsets, affected) {
    const data = recordsets[0]
    res.json(data)
  })
});

router.get('/insertProduct', async function (req, res, next) {
  const name = req.query.name
  const description = req.query.description
  await sql.query(`insert into Product (productname,description) values('${name}','${description}')`, function (erro1, recordsets, affected) {
    res.send(true)
  })
});


router.get('/getStoreProduct', async function (req, res, next) {
  const id = req.query.id
  await sql.query(`select * from Store_Product_View where operaterid=${id}`, function (erro1, recordsets, affected) {
    const data = recordsets[0]
    res.json(data)
  })
});

//提交进货单
router.get('/submitForm', async function (req, res, next) {
  const operaterid = req.query.operaterid
  const supplierid = req.query.supplierid
  const Intime = req.query.Intime
  const tabledata = req.query.tabledata
  let Storeid
  let groupid
  await sql.query(`select Storeid from Store where operaterid=${operaterid}`, async function (erro1, recordsets, affected) {
    Storeid = recordsets[0][0]['Storeid']
    await sql.query(`insert into Product_Group (Intime,operaterid,storeid,Supplierid) values('${Intime}','${operaterid}','${Storeid}','${supplierid}')`, async function (erro1, recordsets, affected) {
      await sql.query(`select top 1 * from  Product_Group order by groupid desc`, function (erro1, recordsets, affected) {
        groupid = recordsets[0][0]['groupid']
        tabledata.forEach(async function (element) {
          const item = JSON.parse(element)
          await sql.query(`insert into Product_Group_Details (productid,groupid,number) values('${item['productid']}','${groupid}','${item['number']}')`, function (erro1, recordsets, affected) {
          })
        })
        res.send(true)
      })
    })
  })


  // await sql.query(`select Storeid from Store where operaterid=${operaterid}`, async function (erro1, recordsets, affected) {
  //   Storeid = recordsets[0][0]['Storeid']
  // })
  // await sql.query(`insert into Product_Group (Intime,operaterid,storeid,Supplierid) values('${Intime}','${operaterid}','${Storeid}','${supplierid}')`, function (erro1, recordsets, affected) {
  // })
  // await sql.query(`select top 1 * from  Product_Group order by groupid desc`, function (erro1, recordsets, affected) {
  //   groupid = recordsets[0][0]['groupid']
  //   tabledata.forEach(async function (element) {
  //     await sql.query(`insert into Product_Group_Details (productid,groupid,number) values('${element.productid}','${groupid}','${element.number}')`, function (erro1, recordsets, affected) {
  //     })
  //   });
  //   res.send(true)
  // })

});

router.get('/getProductGroup', async function (req, res, next) {
  const operaterid = req.query.userid
  await sql.query(`select * from Product_Group_View where operaterid=${operaterid}`, function (erro1, recordsets, affected) {
    const data = recordsets[0]
    res.json(data)
  })
});

router.get('/getGroupdetails', async function (req, res, next) {
  const groupid = req.query.groupid
  await sql.query(`select * from Product_Group_Details_View where groupid=${groupid}`, function (erro1, recordsets, affected) {
    const data = recordsets[0]
    res.json(data)
  })
});

//先有进货单，再进货
router.get('/importProduct', async function (req, res, next) {
  const groupid=req.query.groupid
  const storeid=req.query.storeid
  await sql.query(`update Product_Group set state='已导入' where groupid =${groupid}`, function (erro1, recordsets, affected) {
  })
  await sql.query(`select * from Product_Group_Details_View where groupid =${groupid}`, function (erro1, recordsets, affected) {
    const arraydata = recordsets[0]
      arraydata.forEach(async function(element) {
        await sql.query(`select * from Store_Product_Details where storeid=${storeid} and productid=${element['productid']}`,async function (erro1, recordsets, affected) {
                    if(recordsets[0].length==0){
                    await sql.query(
                      `insert into Store_Product_Details (storeid,productid,number) values ('${storeid}','${element['productid']}','${element['number']}')`,
                     function (erro1, recordsets, affected) {
                    })
                  }
                  else{
                    await sql.query(
                      `update Store_Product_Details set number=${element['number']+recordsets[0][0]['number']} where productid=${element['productid']}`,
                     function (erro1, recordsets, affected) {
                    })
                  }
        })
        
      });
      res.send(true)
  })
  
});


module.exports = router;