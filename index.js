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
				description: "The starting date of the timetable to fetch (in ISO-8601 format)",
				required: true
			},
			to: {
				alias: 't',
				description: "The ending date of the timetable to fetch (in ISO-8601 format)",
				required: true
			},
			output: {
				alias: 'o',
				description: "The output file to output",
			},
			username: {
				alias: 'u',
				description: "The username to use to log in"
			},
			password: {
				alias: 'p',
				description: "The password to use to log in"
			},
			url: {
				alias: 'U',
				description: "The url to log in"
			}
		})
	.argv;

	const from = argv.from;
	const to = argv.to;

	let username = "";
	let password = "";
	let url = "";
	if (username !== undefined && password !== undefined && url != undefined) {
		username = argv.username;
		password = argv.password;
		url = argv.url;
	} else {
		const configFile = process.env.HOME+"/.config/pronote-timetable-fetch.conf"
		let config = JSON.parse(fs.readFileSync(configFile));
		username = config["username"]
		password = Buffer.from(config["password"], "base64").toString("UTF-8")
		url = config["url"]
	}
	const timetableFrom = new Date(from);
	const timetableTo = new Date(to);
    const session = await pronote.login(url, username, password/*, cas*/);
	let result = {};
    const timetable = await session.timetable(timetableFrom, timetableTo);
	result["timetable"] = timetable;
	result["name"] = session.user.name;
	if (argv.output === undefined) {
		console.log(JSON.stringify(result));
		console.log("OUPTUT is undefined")
	} else {
		console.log(JSON.stringify(result));
		console.log("Output file is : `"+argv.output+"`")
		fs.writeFile(argv.output, JSON.stringify(result), (error) => {if (error) {console.log(error);}});
	}
	return 0;
}

main().catch(err => {
    if (err.code === pronote.errors.WRONG_CREDENTIALS.code) {
        console.error('Bad credentials');
    } else {
        console.error(err);
    }
});
