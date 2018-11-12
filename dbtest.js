// const sql = require('mssql')
// async function test() {
//     try {
//         await sql.connect('mssql://test:test@localhost/Server')
//         const result = await sql.query`select * from UserTest`
//         console.log(result.recordset)
//     } catch (err) {
//         console.log(result)
//         // ... error checks
//     }
// }

const sql =require('./db/mssql-db')
async function test() {
    const name ='admin'
    await sql.query(`select * from UserTest where name ='${name}'`,function(error,recordsets,affected){
        console.log(recordsets)
        
    })
}
test()