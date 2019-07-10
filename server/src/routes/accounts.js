import app from '../server';
import { ObjectId } from 'mongodb';

const router = require('express').Router();

//add new account(s) to db
router.post('/user/:username/provider/:providerName/accounts', (req,res,next) => {    
    Promise.resolve().then(async ()=> {        
        const db = app.locals.db;   
        const collection = req.params.providerName;
        
        //mutate req.body to have username in each document
        const username = req.params.username;
        const userAccounts = req.body;        
        for (const userAccount of userAccounts) {
            userAccount.username = username;
        }
        
        //insert many accounts in one write operation
        const result = await db.collection(collection).insertMany(userAccounts);
        res.status(201).send(result.ops);        
    }).catch(next);    
});

//get account(s) from db for a given user in a given provider
router.get('/user/:username/provider/:providerName/accounts',(req,res,next)=> {
    Promise.resolve().then(async ()=> {
        const db = app.locals.db;
        const username = req.params.username;
        const collection = req.params.providerName;

        //.toArray() is good enough for 'n' number of docs and then there might be chance of outOfMemory/performance leak. During performance test we should find value of this 'n'.
        //TODO: in future we might want to use Cursor object to iterate over docs in chunks and return results.         
        const accounts = await db.collection(collection).find({username: username}).toArray();
        res.status(200).send(accounts);

    }).catch(next);
})

//get account details for a particular accountId for a given user in a given provider
router.get('/user/:username/provider/:providerName/account/:accountId',(req,res,next)=> {
    Promise.resolve().then(async ()=> {
        const db = app.locals.db;
        const username = req.params.username;
        const collection = req.params.providerName;
        const accountId = req.params.accountId;

        const accountDetails = await db.collection(collection).find({username:username,_id:ObjectId(accountId)}).toArray();       
        res.status(200).send(accountDetails);

    }).catch(next);
})



//delete an account from db per user per provider
router.delete('/user/:username/provider/:providerName/account/:docId',(req,res,next) => {
    Promise.resolve().then(async ()=> {
        const db = app.locals.db;
        const collection = req.params.providerName;
        const docId = req.params.docId;

        const result = await db.collection(collection).deleteOne({_id:ObjectId(docId)});
        if (result) {
            if (result.deletedCount === 1) {
                res.status(200).send({message: 'account deleted successfully'});
            }
            else {
                res.status(200).send({error: 'account doesn`t exist'});
            }
        }
        else {
            res.sendStatus(500);
        }
    }).catch(next);
})

//update an account 
router.put('/user/:username/provider/:providerName/account/:docId',(req,res,next)=> {
    Promise.resolve().then(async ()=> {
        const db = app.locals.db;        
        const collection = req.params.providerName;
        const docId = req.params.docId;
        const body = req.body;        

        //prepare $unset object if exist from req.body
        const unset = {};
        for (const key in body) {
            if(body.hasOwnProperty(key)) {
                let value = body[key];
                //if it's an embedded object then find value of last nested key for $unset                
                if(typeof value === 'object') {                                        
                    while(typeof value === 'object') {
                        let tmpKey = Object.getOwnPropertyNames(value)[0];                        
                        value = value[tmpKey];
                    }                    
                }
                if(value === 'null' || /^\s*$/.test(value)) {
                    unset[key] = '';    
                }                
            }
        }

        let result = await db.collection(collection).updateOne({_id:ObjectId(docId)},{$set:body});
        if(Object.keys(unset).length !== 0) {
            result = await db.collection(collection).updateOne({_id:ObjectId(docId)},{$unset:unset});
        }
        
        if (result) {
            if (result.modifiedCount === 1) {
                res.status(200).send({message: 'account updated successfully'});
            }
            else {
                res.status(200).send({error: `account didn't get updated`});
            }
        }
        else {
            res.sendStatus(500);
        }
              
    }).catch(next);
})

export default router;
