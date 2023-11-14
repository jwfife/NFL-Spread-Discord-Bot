require('dotenv').config(); //has access to .env file
const { Client, IntentsBitField, EmbedBuilder } = require('discord.js');

const client = new Client({ //bot instance
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages, //takes messages
        IntentsBitField.Flags.MessageContent, //reads messages
    ]
});

/*.on has access to list of events (event handler)
- c is our bot
c.user = bot username
.tag is discord tag*/
client.on('ready', (c) => {
    console.log(`${c.user.tag} is online!`);
});

const puppeteer = require('puppeteer');
let quotes = "No data yet";

(async () => {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.goto('https://sportsdata.usatoday.com/football/nfl/odds'); //goes to the specified site

    quotes = await page.evaluate(() => {
        const spreadElements = document.querySelectorAll('.class-p7TUuYs'); //spreads
        const teamElements = document.querySelectorAll('.class-8n8fzVk'); //team names
        const weekElements = document.querySelectorAll('.class-urWQNRe');
        const teamArray = [];
        const spreadArray = [];
        const weekArray = [];
        
        /*
        for (const quoteElement of quoteElements){ 
            const poopText = quoteElement.querySelector('b.class-p7TUuYs').textContent;
            quotesArray.push({
                //AwayTeam: quoteText,
                Spread: poopText,
            });
        }
        */

        for (var i = 0; i < teamElements.length; i++) {
            if (i % 2 !== 0){
                teamArray.push({HomeTeam: teamElements[i].textContent});
            }
            else{
                teamArray.push({AwayTeam: teamElements[i].textContent});
            }
        }

        for (var k = 0; k < spreadElements.length; k += 3) {
            spreadArray.push({Spread: spreadElements[k].textContent});
        }

        var count = 0;
        for (var n = 1; n < spreadElements.length -32; n +=2) {
            teamArray.splice(n, 0, spreadArray[count]);
            count++;
        }

        for (var m = 0; m < weekElements.length; m++){
            weekArray.push(weekElements[m].textContent);
        }

        return teamArray;
    });

    var sample = [];
    var count = 0;

    for (var m = 0; m < quotes.length; m += 4) {
        if (quotes[m] !== null){
            sample.push({
                AwayTeam: (JSON.stringify(quotes[m])).replace('"AwayTeam":"', ''),
                AwaySpread: (JSON.stringify(quotes[m+1])).replace('"Spread":"', ''),
                HomeTeam: (JSON.stringify(quotes[m+2])).replace('"HomeTeam":"', ''),
                HomeSpread: (JSON.stringify(quotes[m+3])).replace('"Spread":"', ''),
            })
        }
        else {
            continue;
        }
    };

    myJSON = JSON.stringify(sample, null, null);
    console.log(sample);
    await browser.close();

})()

/*
Creates a message/replies based on message sent in discord
*/

client.on('messageCreate', (message) => {
    if (message.author.bot) {
        return;
    }

    switch(message.content.toLowerCase()) {
        case "!spread":
            message.reply(`This week's spreads \n ${myJSON}`);
            break;
        case "!spreads":
            message.reply(myJSON);
            break;
        case "!picks":
            message.reply(myJSON);
            break;
        case "!nfl":
           message.reply(myJSON);
           break;
        case "!commands":
            message.reply("To get my attention, use any of these commands! (case insensitive) !spread(s), !picks, !nfl");
            break;
        default:
          // code block
      }
});

randomQuote = (message) => {
    message.reply(quotes);
  }

client.login(process.env.TOKEN); //bot's password (keep safe, can reset token)