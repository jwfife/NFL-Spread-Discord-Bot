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
let spreads = "No data yet";
var currentTime = new Date();

//grabs the data from the page
(async () => {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.goto('https://sportsdata.usatoday.com/football/nfl/odds'); //goes to the specified site

    spreads = await page.evaluate(() => {
        const weekElements = document.querySelectorAll('.class-5lL8deo'); //weeks/dates
        const spreadElements = document.querySelectorAll('.class-p7TUuYs'); //spreads
        const teamElements = document.querySelectorAll('.class-8n8fzVk'); //team names
        const weekArray = [];
        const teamArray = [];
        const spreadArray = [];
        const numTeams = spreadElements.length - teamElements.length; //number of teams playing this week
        
        

        //adds the home teams and away teams to the teamArray
        for (var i = 0; i < teamElements.length; i++) {
            if (i % 2 !== 0){
                teamArray.push({HomeTeam: teamElements[i].textContent});
            }
            else{
                teamArray.push({AwayTeam: teamElements[i].textContent});
            }
        }

        //adds the spreads to the spread array
        for (var k = 0; k < spreadElements.length; k += 3) {
            spreadArray.push({Spread: spreadElements[k].textContent});
        }

        //splices the team array and the spread array together in their respective places
        var count = 0;
        for (var n = 1; n < numTeams; n +=2) {
            teamArray.splice(n, 0, spreadArray[count]);
            count++;
        }

        return teamArray;
    });

    var finalArray = [];

    //creates a new array of strings with less filler text
    for (var m = 0; m < spreads.length; m += 4) {
        if (spreads[m] !== null){
            finalArray.push({
                AwayTeam: (JSON.stringify(spreads[m])).replace('"AwayTeam":"', ''),
                AwaySpread: (JSON.stringify(spreads[m+1])).replace('"Spread":"', '') + '                                       ',
                HomeTeam: (JSON.stringify(spreads[m+2])).replace('"HomeTeam":"', ''),
                HomeSpread: (JSON.stringify(spreads[m+3])).replace('"Spread":"', '') + '                                       ',
            })
        }
        else {
            continue;
        }
    };

    //stringifies the finalArray array
    myJSON = JSON.stringify(finalArray, null, null);
    console.log(myJSON);
    await browser.close();

})()

/*
Creates a message/replies based on message sent in discord
*/

client.on('messageCreate', (message) => {
    if (message.author.bot) {
        return;
    }

    var newLineChar = '\\n';

    switch(message.content.toLowerCase()) {
        case "!spread":
            sendSpreads(message);
            break;
        case "!spreads":
            sendSpreads(message);
            break;
        case "!picks":
            sendSpreads(message);
            break;
        case "!nfl":
            sendSpreads(message);
           break;
        case "!commands":
            message.reply("To get my attention, use any of these commands! (case insensitive) !spread(s), !picks, !nfl");
            break;
        default:
          // code block
      }
});

function sendSpreads(message){
    for (let i = 0; i < myJSON.length; i += 20){
        if (myJSON[i] === ","){
            myJSON = myJSON.slice(0, i) + newLineChar + myJSON.slice(i);
        }
    }
    message.channel.send('```json\n' + myJSON + '\n```');
}

client.login(process.env.TOKEN); //bot's password (keep safe, can reset token)
