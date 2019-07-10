import express from 'express';
import app from '../server';

const router = express.Router();

/* Best way - using async/await function along with Promise to avoid try..catch block,
If you don't understand it then refer the same function below this using try..catch */ 
//add a new user to db
router.post('/user', (req,res,next) => {    
    Promise.resolve().then(async ()=> {
        const db = app.locals.db;   
        
        //find if user already exist else insert the user
        const userData = req.body;
        const username = userData.username;
        const user = await db.collection('users').findOne({username: username},{projection:{_id:1}});
        if (!user) { 
            userData.timestamp = new Date();
            const result = await db.collection('users').insertOne(userData);
            res.status(201).send(result.ops[0]);
        }
        else {
            res.status(200).send({error:'user already exist'}); 
        }
    }).catch(next);    
});

//Better but not best way - this is the same function as above but with try..catch which is shown above
//add a new user to db
/* router.post('/user', async (req,res) => {
    try {
        const db = app.locals.db;   
        
        //find if user already exist else insert the user
        const userData = req.body;
        const username = userData.username;
        const user = await db.collection('users').findOne({username: username},{projection:{username:1}});
        if (!user) {
            const result = await db.collection('users').insertOne(userData);
            res.status(201).send(result.ops[0]);
        }
        else {
            res.status(200).send({message:'user already exist'}); 
        }        
    }          
    catch (err) {
        return next(err);        
    }
}); */

//Good but not better way - using Promise chain to sequence fun calls 
//add a new user to db
/* router.post('/user', (req,res,next) => {
    const db = app.locals.db;   
        
    //find if user already exist else insert the user
    const userData = req.body;
    const username = userData.username;
    db.collection('users').findOne({username: username},{projection:{username: 1}})
        .then(user=>{
            if (!user) {
                db.collection('users').insertOne(userData)
                    .then(result=>{
                        res.status(201).send(result.ops[0]);                
                    })
                    .catch(next)
            }
            else {
                res.status(200).send({message:'user already exist'});         
            }
        })
        .catch(next)               
}); */

//get a user from db 
router.get('/user',(req,res,next)=> {
    Promise.resolve().then(async ()=> {
        const db = app.locals.db;
        const username = req.query.username;
        const password = req.query.password;

        if (!username && !password) {
            res.status(200).send({error: 'username & password are mandatory'});
            return;
        }
        let user = await db.collection('users').findOne({username: username});
        if (user) {
            user = await db.collection('users').findOne({username: username,password: password},
                {projection:{_id:0}});
            if (user) {
                res.status(200).send(user);                
            }
            else {
                res.status(200).send({error: 'invalid password'});
            }
        }
        else {
            res.status(200).send({error: 'invalid username'})
        }
    }).catch(next);
})

//delete a user from db
router.delete('/user',(req,res,next) => {
    Promise.resolve().then(async ()=> {
        const db = app.locals.db;
        const username = req.query.username;
        const password = req.query.password;

        const result = await db.collection('users').deleteOne({username:username,password:password});
        if (result) {
            if (result.deletedCount === 1) {
                res.status(200).send({message: 'deleted successfully'});
            }
            else {
                res.status(200).send({error: 'user doesn`t exist'});
            }
        }
        else {
            res.sendStatus(500);
        }
    }).catch(next);
})

export default router;
