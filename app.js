const cheerio = require("cheerio");
const axios = require("axios");
const Telegraf = require('telegraf');;
const http = require('http'); //importing http

const PORT = process.env.PORT || 3000;
const URL = process.env.URL || 'https://pure-wildwood-81535.herokuapp.com/';

const API_TOKEN = process.env.API_TOKEN || '1006538565:AAH-F4zxZG3cz3zvdNFWhE6eRzc6HeaTzP8';
const bot = new Telegraf(API_TOKEN);
bot.telegram.setWebhook(`${URL}/bot${API_TOKEN}`);
bot.startWebhook(`/bot${API_TOKEN}`, null, PORT)
const siteUrl = "http://www.restauranteuniversitario.uerj.br/cardapio.html";


bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
//bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.hears(/(segunda|terça|quarta|quinta|sexta)/i, function (ctx) {
    var dias = ['segunda','terça','quarta','quinta','sexta']; 
    var dia = ctx.message.text.match(/(segunda|terça|quarta|quinta|sexta)/i)[0];
    //console.log(dias.indexOf(dia.toLowerCase()))
    ctx.reply(cardapioDia(dias.indexOf(dia.toLowerCase())));
})
bot.hears("obi wan kenobi", (ctx) => ctx.reply('Hello There'))
bot.command("att", function (ctx){
    attCard();
    ctx.reply("cardapio atualizado");
})
bot.launch()

attCard();

function startKeepAlive() { // should make the app work for more than 2h
    setInterval(function() {
        var options = {
            host: 'your_app_name.herokuapp.com',
            port: 80,
            path: '/'
        };
        http.get(options, function(res) {
            res.on('data', function(chunk) {
                try {
                    // optional logging... disable after it's working
                    console.log("HEROKU RESPONSE: " + chunk);
                } catch (err) {
                    console.log(err.message);
                }
            });
        }).on('error', function(err) {
            console.log("Error: " + err.message);
        });
    }, 20 * 60 * 1000); // load every 20 minutes
}

startKeepAlive();

var days = {
    "0":"Segunda-feira",
    "1":"Terça-feira",
    "2":"Quarta-feira",
    "3":"Quinta-feira",
    "4":"Sexta-feira"
}

var estrutura = {
    "0":"Salada 1",
    "1":"Salada 2",
    "2":"Prato principal",
    "3":"Opção",
    "4":"Guarnição",
    "5":"Acompanhamentos",
    "6":"Acompanhamentos",
    "7":"Doce",
}

var data = {
    "Segunda-feira":[],
    "Terça-feira":[],
    "Quarta-feira":[],
    "Quinta-feira":[],
    "Sexta-feira":[]
};
function attCard() {
    axios.get(siteUrl)
    .then(response => {
        getData(response.data);
        //console.log(data[days[1]][0][estrutura[0]])
    })
    .catch(error => {
        console.log(error);
    })
}


function getData(html){
    const $ = cheerio.load(html);
    var table = $('#cardapio').first();
    var tr = table.find('tr');
    for(i=1;i<tr.length;i++){//linhas -> estrutura
        var td = tr.eq(i).find('td');
        for(j=1;j<td.length;j++){//colunas -> conteudo
            var obj = {};
            obj[estrutura[i-1]] = td.eq(j).text();;
            data[days[j-1]].push(obj);
        }
    }
}

function cardapioDia(dia) {
    return "Na "+days[dia]+
        " terá como salada "+
        data[days[dia]][0][estrutura[0]]+
        " e "+
        data[days[dia]][1][estrutura[1]]+
        " e como prato principal "+
        data[days[dia]][2][estrutura[2]]+
        " ou caso prefira, a opção vegetariana "+
        data[days[dia]][3][estrutura[3]]+
        " para guarnição "+
        data[days[dia]][4][estrutura[4]]+
        " com os seguntes acompanhamentos "+
        data[days[dia]][5][estrutura[5]]+
        " e "+
        data[days[dia]][6][estrutura[6]]+
        " e para sobremesa "+
        data[days[dia]][7][estrutura[7]]+"."
}

