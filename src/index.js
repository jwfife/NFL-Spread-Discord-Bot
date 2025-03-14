require('dotenv').config(); //has access to .env file
const { Client, IntentsBitField} = require('discord.js');

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

//grabs the data from the page
(async () => {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.goto('https://sportsdata.usatoday.com/football/nfl/odds'); //goes to the specified site

    spreads = await page.evaluate(() => {
        const teamElements = document.querySelectorAll('.class-8n8fzVk'); //team names
        const spreadElements = document.querySelectorAll('.class-p7TUuYs'); //spreads
        const teamArray = [];
        const spreadArray = [];
        const numTeams = spreadElements.length - teamElements.length; //number of teams playing this week

        //adds the home teams and away teams to the teamArray
        for (var i = 0; i < teamElements.length; i++) {
            if (i % 2 !== 0){
                teamArray.push({HomeTeam: teamElements[i].innerText});
            }
            else{
                teamArray.push({AwayTeam: teamElements[i].innerText});
            }
        }

        //adds the spreads to the spread array
        for (var k = 0; k < spreadElements.length; k += 3) {
            spreadArray.push({Spread: spreadElements[k].innerText});
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
    stringFinalArrayJSON = JSON.stringify(finalArray, null, null);
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
            message.reply("To get my attention, use any of these commands! \n (case insensitive) \n - !spread(s) \n - !picks \n - !nfl");
            break;
        default:
            message.reply("Please use !commands for a list of commands to use.")
      }
});

function sendSpreads(message){
    for (let i = 0; i < stringFinalArrayJSON.length; i += 20){
        if (stringFinalArrayJSON[i] === ","){
            stringFinalArrayJSON = stringFinalArrayJSON.slice(0, i) + newLineChar + stringFinalArrayJSON.slice(i);
        }
    }
    message.channel.send('```json\n' + stringFinalArrayJSON + '\n```');
}

client.login(process.env.TOKEN); //bot's password (keep safe, can reset token)
