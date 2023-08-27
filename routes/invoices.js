const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db')

router.get("/",async(req, res, next) => {
    try{
        const results = await db.query('SELECT id, comp_code FROM invoices')
        return res.json({invoices:results.rows})
    } catch(e){
        return next(e)
    }
})

router.get("/:id", async(req, res, next) => {
    try{
        const {id} = req.params
        const results = await db.query('SELECT id, amt, paid, add_date, paid_date, c.code, c.name, c.description FROM invoices i JOIN companies c ON i.comp_code = c.code  WHERE id=$1', [id])
        if(results.rows.length === 0) throw new ExpressError(`Invoice id ${id} not found.`, 404)
        return res.json({invoice:results.rows[0]})
    } catch(e) {
        return next(e)
    }
})

router.post("/", async(req, res, next) => {
    try{
        const {comp_code, amt} = req.body
        if(!comp_code) throw new ExpressError("Comp_code is required",400)
        if(!amt) throw new ExpressError("Amount is required",400)
        const results = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date',[comp_code, amt])
        return res.json({invoice:results.rows[0]})
    } catch(e) {
        return next(e)
    }
})

router.put("/:id", async(req, res, next) => {
    try{
        const {id} = req.params;
        const {amt} = req.body;
        const results = await db.query('UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date', [amt, id])
        if(results.rows.length === 0) throw new ExpressError(`invoice id ${id} not found.`, 404)
        return res.json({invoice:results.rows[0]})
    } catch(e) {
        return next(e);
    }
})

router.delete("/:id", async(req, res, next) => {
    try{
        const {id} = req.params;
        const results = db.query('DELETE FROM invoices WHERE id = $1',[id])
        return res.send({msg:"Deleted"})
    } catch(e){
        return next(e)
    }
})



module.exports = router;