#!/usr/bin/env node

const pronote = require('pronote-api');

const fs = require('fs')

async function main()
{
	var argv = require('yargs/yargs')(process.argv.slice(2))
		.usage('Fetch pronote timetable using Pronote-API\n\nUsage: pronote-timetable-fetch [options]')
		.help('help').alias('help', 'h')
		.version('version', '0.1').alias('version', 'V')
		.options({
			from: {
				alias: 'f',
				description: "The starting date of the timeline to fetch (in ISO-8601 format)",
				required: true
			},
			to: {
				alias: 't',
				description: "The ending date of the timeline to fetch (in ISO-8601 format)",
				required: true
			}
		})
	.argv;

	const from = argv.from;
	const to = argv.to;

	const configFile = process.env.HOME+"/.config/pronote-timetable-fetch.conf"
	console.log(configFile)
	let config = JSON.parse(fs.readFileSync(configFile));
	username = config["username"]
	password = Buffer.from(config["password"], "base64").toString("UTF-8")
	url = config["url"]
	console.log(password)

	const timetableFrom = new Date(from);
	const timetableTo = new Date(to);
	console.log(timetableFrom, timetableTo);
    const session = await pronote.login(url, username, password/*, cas*/);
    console.log(session.user.name);
    console.log(session.user.studentClass.name);
	let result = {};
    const timetable = await session.timetable(timetableFrom, timetableTo);
	result["timetable"] = timetable;
	result["name"] = session.user.name;

    fs.writeFile('timetable.json', JSON.stringify(result), (error) => {console.log(error)}); 
    console.log(timetable); 
}

main().catch(err => {
    if (err.code === pronote.errors.WRONG_CREDENTIALS.code) {
        console.error('Mauvais identifiants');    
    } else {
        console.error(err);
    }
});
