require('dotenv').config(); //has access to .env file
const { Client, IntentsBitField } = require('discord.js');

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

(async () => {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.goto('https://sportsdata.usatoday.com/football/nfl/odds'); //goes to the specified site

    const quotes = await page.evaluate(() => {
        const spreadElements = document.querySelectorAll('.class-p7TUuYs'); //spreads
        const teamElements = document.querySelectorAll('.class-8n8fzVk'); //team names
        const teamArray = [];
        const spreadArray = [];
        const fullArray = [];
        
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
        
        return teamArray;
    });

    console.log(quotes);
    

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
        case "!winston":
            randomQuote(message);
            break;
        case "!winton":
            randomQuote(message);
            break;
        case "!monkey":
            message.reply("I'm not a monkey... I'm a scientist.");
            break;
        case "!peanut butter":
           message.reply("Did somebody say *peanut butter*?");
           break;
        case "!commands":
            message.reply("To get my attention, use any of these 3 commands! (case insensitive) !winston, !winton, !monkey");
            break;
        default:
          // code block
      }
});

randomQuote = (message) => {
    const quotes = ["Hi there!", "Salutations.", "No, I do not want a banana.", "Did somebody say *peanut butter*?", 
    "No monkey business.", "How embarrassing!", "Get a load of this!", "Greetings!", "That was bananas!", 
    "A gorilla never forgets. Like elephants!", "Coming through!", "Winston reporting.",
    "Did you miss me? Because I missed you!", "Excuse me for dropping in.", "Did someone call?"];
    const quoteIndex = Math.floor(Math.random() * 16);
    message.reply(quotes[quoteIndex]);
  }

client.login(process.env.TOKEN); //bot's password (keep safe, can reset token)