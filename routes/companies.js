const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db')

router.get("/",async(req, res, next) => {
    try{
        const results = await db.query('SELECT code, name FROM companies')
        return res.json({companies:results.rows})
    } catch(e){
        return next(e)
    }
})

// router.get("/:code", async(req, res, next) => {
//     try{
//         const {code} = req.params
//         const results = await db.query('SELECT code, name, description FROM companies WHERE code=$1', [code])
//         if(results.rows.length === 0) throw new ExpressError(`Company code ${code} not found.`, 404)
//         return res.json({company:results.rows[0]})
//     } catch(e) {
//         return next(e)
//     }
// })

router.post("/", async(req, res, next) => {
    try{
        const {code, name, description} = req.body
        if(!code) throw new ExpressError("Company code is required",400)
        if(!name) throw new ExpressError("Company name is required",400)
        if(!description) throw new ExpressError("Company description is required",400)
        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description',[code, name, description])
        return res.json({company:results.rows[0]})
    } catch(e) {
        return next(e)
    }
})

router.put("/:code", async(req, res, next) => {
    try{
        const {code} = req.params;
        const {name, description} = req.body;
        const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description', [name, description,code])
        console.log(results)
        if(results.rows.length === 0) throw new ExpressError(`Company code ${code} not found.`, 404)
        return res.json({company:results.rows[0]})
    } catch(e) {
        return next(e);
    }
})

router.delete("/:code", async(req, res, next) => {
    try{
        const {code} = req.params;
        const results = await db.query('DELETE FROM companies WHERE code = $1',[code])
        return res.send({msg:"Deleted"})
    } catch(e){
        return next(e)
    }
})

router.get("/:code", async(req, res, next) => {
    try{
        const {code} = req.params;
        const results = await db.query('SELECT code, name, description, i.id FROM companies c JOIN invoices i ON c.code = i.comp_code WHERE code = $1', [code])
        if(results.rows.length === 0) throw new ExpressError(`Company code ${code} not found.`, 404)
        return res.send({company:results.rows})

    } catch(e) {
        return next(e)
    }
})

module.exports = router;