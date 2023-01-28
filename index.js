const axios = require('axios');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const XAuthToken = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"; // Get it by typing console.log(`X-Auth-Token: ${localStorage.getItem("TinderWeb/APIToken")}`); in the browser's console
const matchID = ""; //Open the conv you want, and the id will be on the URL after https://tinder.com/app/messages/

// Sends a message to a match
async function message(matchID, message) {
    const data = { 
        userId: matchID.slice(0, 24),
        otherId: matchID.slice(-24),
        matchId: matchID,
        sessionId: null,
        message: message 
    }
	await axios
		.post( `https://api.gotinder.com/user/matches/${matchID}?locale=en`,
			data,
			{
				headers: {
					"Content-Length": 165 + message.length,
					"Sec-Ch-Ua": '"Chromium";v="109", "Not_A Brand";v="99"',
					"Accept-Language": "en,en-US",
					"App-Session-Time-Elapsed": "150500",
					"X-Auth-Token": XAuthToken,
					"User-Session-Time-Elapsed": "150006",
					"Sec-Ch-Ua-Platform": '"Windows"',
					"X-Supported-Image-Formats": "webp,jpeg",
					"Tinder-Version": "4.1.1",
					"Sec-Ch-Ua-Mobile": "?0",
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.5414.75 Safari/537.36",
					"Content-Type": "application/json",
					Accept: "application/json",
					Platform: "web",
					"App-Version": "1040101",
					Origin: "https://tinder.com",
					"Sec-Fetch-Site": "cross-site",
					"Sec-Fetch-Mode": "cors",
					"Sec-Fetch-Dest": "empty",
					Referer: "https://tinder.com/",
				},
			}
		)
		.then(function (response) {
			console.log("Message send");
		})
		.catch(function (error) {
			console.log(error);
		});
}

// Gets the messages from the conv and saves them in the db
async function getMessages(matchID) {
    await axios.get(`https://api.gotinder.com/v2/matches/${matchID}/messages?locale=en&count=100`, {
        headers: {
            "Content-Length": 0,
            "Sec-Ch-Ua": '"Chromium";v="109", "Not_A Brand";v="99"',
            "Accept-Language": "en,en-US",
            "App-Session-Time-Elapsed": "150500",
            "X-Auth-Token": XAuthToken,
            "User-Session-Time-Elapsed": "150006",
            "Sec-Ch-Ua-Platform": '"Windows"',
            "X-Supported-Image-Formats": "webp,jpeg",
            "Tinder-Version": "4.1.1",
            "Sec-Ch-Ua-Mobile": "?0",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.5414.75 Safari/537.36",
            Accept: "application/json",
            "App-Version": "1040101",
            Origin: "https://tinder.com",
            "Sec-Fetch-Site": "cross-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            Referer: "https://tinder.com/",
        },
    })
    .then(async function (response) {
        if (await db.get(matchID) == undefined) {
            await db.set(matchID, response.data.data.messages);
            return console.log("New conv saved.")
        }

        const saved = await db.get("63b1ddbd35ce84010001f26e63d0fc77fbfc9101005d3b92");
        if (await saved.length < response.data.data.messages.length) {
            await db.set(matchID, response.data.data.messages);
            return console.log(`New message: ${response.data.data.messages[0].message}`);
        }

        return console.log("No new messages.");

    })
    .catch(function (error) {
        console.log(error);
    });
}

// Parses the conv and returns it as a string
async function parseConv(matchID) {
    const conv = await db.get(matchID);
    let messages = ''
    conv.reverse();
    for (let i = 0; i < conv.length; i++) {
        if (conv[i].to == matchID.slice(0, 24)) {
            messages += `User: ${conv[i].message}\n`
        } else {
            messages += `Me: ${conv[i].message}\n`
        }
    }
    return messages;
}

// Validation methods for token and matchID, use them if you want
//      if (XAuthToken.length != 36) return console.log("X-Auth-Token is not in the correct format.");
//      if (matchID.length != 48) return console.log("MatchID is not in the correct format.");

// Execute as you want
getMessages(matchID).then(async function() {
    console.log(await parseConv(matchID));
});
