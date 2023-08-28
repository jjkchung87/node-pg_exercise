const express = require('express');
const ExpressError = require('../expressError');
const slugify = require('slugify')
const router = express.Router();
const db = require('../db')

router.get("/",async(req, res, next) => {
    try{
        const industries = await db.query(`SELECT code, industry_name
                                            FROM industries`)

        const results = await db.query(`SELECT i.code, i.industry_name, ci.company_code
                                        FROM industries i
                                        LEFT JOIN companies_industries ci
                                        ON i.code = ci.industry_code`)

        const industry_output = industries.rows;
        console.log(industry_output)

        results.rows.forEach(row => {
            if(industry_output[row.industry_name].company_codes) {
                industry_output[row.industry_name].company_codes.push(row.company_code)
            } else {
                industry_output[row.industry_name].company_codes = [row.company_code]
            }
        })
        
        return res.json({industries:results.rows})
    } catch(e){
        return next(e)
    }
})


// router.get("/:code", async(req, res, next) => {
//     try{
//         const results = await db.query(
//             `SELECT c.code, c.name, c.description, ind.industry_name
//             FROM companies c 
//             LEFT JOIN companies_industries ci
//             ON c.code = ci.company_code 
//             LEFT JOIN industries ind
//             ON  ci.industry_code = ind.code
//             WHERE c.code = $1`, [req.params.code])

//         console.log(results)
//         if(results.rows.length === 0) throw new ExpressError(`Company code ${req.params.code} not found.`, 404)
//         const {code, name, description} = results.rows[0];
//         const industries = results.rows.map(r => r.industry_name)

//         return res.send({company:{code, name, description, industries}})

//     } catch(e) {
//         return next(e)
//     }
// })

router.post("/", async(req, res, next) => {
    try{
        const {industry_name} = req.body
        if(!industry_name) throw new ExpressError("Industry name is required",400)
        const slug = slugify(industry_name, {lower:true})
        const results = await db.query('INSERT INTO industries (code, industry_name) VALUES ($1, $2) RETURNING code, name',[slug, industry_name])
        return res.status(201).json({industry:results.rows[0]})
    } catch(e) {
        return next(e)
    }
})

router.put("/:code", async(req, res, next) => {
    try{
        const {code} = req.params;
        const {company_code} = req.body;
        const results = await db.query(`UPDATE companies_industries 
                                        SET company_code=$1, industry_code=$2 RETURNING company_code, industry_code`, [company_code, code])
        console.log(results)
        if(results.rows.length === 0) throw new ExpressError(`Company code ${code} not found.`, 404)
        return res.json({company:results.rows[0]})
    } catch(e) {
        return next(e);
    }
})

// router.delete("/:code", async(req, res, next) => {
//     try{
//         const {code} = req.params;
//         const results = await db.query('DELETE FROM companies WHERE code = $1',[code])
//         return res.send({msg:"Deleted"})
//     } catch(e){
//         return next(e)
//     }
// })



module.exports = router;