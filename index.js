const express = require('express');
const bodyParser = require('body-parser');
const {prisma} = require('./generated/prisma-client');

const app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.get('/machine_use', async (req, res) => {
    const allMachines = await prisma.machine();
    res.render('machine_use.ejs', {allMachines});
});

app.post('/machineSel', async (req, res) => {
    const post = await prisma.post.update({
        where: { id: 1 },
        data: { published: true },
    })
    console.log(post)

    var sql = 'UPDATE machine SET userid=?,is_using=1 where mech_id=?';
    var params = [body.user_id, body.mach_id];
    console.log(sql);
    conn.query(sql, params, function(err) {
        if(err) console.log('query is not excuted. insert fail...\n' + err);
        else res.redirect('/machine_use');
    });
});