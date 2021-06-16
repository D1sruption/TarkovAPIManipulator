const settings = require('electron-settings');
const log = require('electron-log');
const ipcMain = require('electron').ipcMain;
require('./globals.js');

PHPSESSID = settings.get("Profile.session_token");

/* **** SENDER FUNCTION **** */
function send(url, _port = 443, path, data, type = "POST"){
	return new Promise ((resolve, reject) => {
		const options = { // options for https data it must stay like this
		  hostname: url,
		  port: _port,
		  path: path,
		  method: type,
		  headers: {
			  'User-Agent':			'UnityPlayer/2018.4.13f1 (UnityWebRequest/1.0, libcurl/7.52.0-DEV',
			  'Content-Type': 		'application/json',
			  'Accept': 			'application/json',
			  'App-Version': 		'EFT Client 0.12.3.5834',
			  'GClient-RequestId': 	integer,
			  'X-Unity-Version':    '2018.4.13f1'
		  } 
		};
		//console.log(options);
		if(PHPSESSID !== ''){ // assign phpsessid only once
			options['headers']['Cookie'] = "PHPSESSID=" + settings.get("Profile.session_token");
			//console.log(options['headers']['Cookie']);
		}
		integer++; // add integer number to request counting requests and also making their stupid RequestId Counter
		zlib.deflate(data, function (err, buffer) { // this is kinda working
			const req = http.request(options, (res) => { // request https data with options above
				//if(typeof res.headers['set-cookie'][1] != "undefined")
					//PHPSESSID = settings.get("Profile.session_token");//res.headers['set-cookie'][1].replace("PHPSESSID=","").replace("; path=/",""); // properly grab PHPSESSID from server
				//console.log("["+integer+"][URL]> " + path + " [StatusCode]" + res.statusCode);
				if(res.statusCode != 200){ 
					reject("No Response: " + res.statusCode);
				}
				let chunks = [];
				res.on('data', (d) => {
					chunks.push(d);
				});
				res.on('end', function(){
					resolve(Buffer.concat(chunks));
				});
			});
			// return error if error on request
			req.on('error', err => {
				reject(err); 
			});
			req.write(buffer);
			req.end();
		});
	});
}
/* **** CLIENT REQEUSTS FUNCTION **** */
async function ClientRequests(){
	//console.log("dumping game responses ...");
	//below paths and data to grab content from traders url
	let tradersOnly = [
		// "/client/trading/customization/storage", 
		// "/client/trading/api/getTradersList", 
		// "/client/trading/api/getTraderAssort/54cb50c76803fa8b248b4571", 
		// "/client/trading/api/getTraderAssort/54cb57776803fa99248b456e", 
		// "/client/trading/api/getTraderAssort/579dc571d53a0658a154fbec", 
		// "/client/trading/api/getTraderAssort/58330581ace78e27b8b10cee", 
		// "/client/trading/api/getTraderAssort/5935c25fb3acc3127c3d8cd9", 
		// "/client/trading/api/getTraderAssort/5a7c2eca46aef81a7ca2145d", 
		// "/client/trading/api/getTraderAssort/5ac3b934156ae10c4430e83c", 
		// "/client/trading/api/getTraderAssort/5c06531a86f7746319710e1b",
		// "/client/trading/customization/5ac3b934156ae10c4430e83c/offers"
	];
	// paths to grab data from
	let path = [
		// /* Auth */	"/client/game/config",
		// /* mEn	*/	"/client/menu/locale/en",
		// /* mRu	*/	"/client/menu/locale/ru",
		// /* mGe	*/	"/client/menu/locale/ge",
		// /* mFr	*/	"/client/menu/locale/fr",
		// /* val	*/	"/client/game/version/validate",
		// /* KA	*/	"/client/game/keepalive",
		// /* lang	*/	"/client/languages",
		// /* itm	*/	"/client/items",
		// /* P_L	*/	"/client/game/profile/list",
		/* P_S	*/	"/client/game/profile/select",
		// /* gtl	*/	"/client/trading/api/getTradersList",
		// /* gt_1	*/	"/client/trading/api/getTraderAssort/54cb50c76803fa8b248b4571",
		// /* gt_2	*/	"/client/trading/api/getTraderAssort/54cb57776803fa99248b456e",
		// /* gt_3	*/	"/client/trading/api/getTraderAssort/579dc571d53a0658a154fbec",
		// /* gt_4	*/	"/client/trading/api/getTraderAssort/58330581ace78e27b8b10cee",
		// /* gt_5	*/	"/client/trading/api/getTraderAssort/5935c25fb3acc3127c3d8cd9",
		// /* gt_6	*/	"/client/trading/api/getTraderAssort/5a7c2eca46aef81a7ca2145d",
		// /* KA	*/	"/client/game/keepalive",
		// /* gt_7	*/	"/client/trading/api/getTraderAssort/5ac3b934156ae10c4430e83c",
		// /* tser	*/	"/client/trading/customization/5ac3b934156ae10c4430e83c/offers",
		// /* gt_8	*/	"/client/trading/api/getTraderAssort/5c06531a86f7746319710e1b",
		// /* cust	*/	"/client/customization",
		// /* glob	*/	"/client/globals",
		// /* prSt	*/	"/client/profile/status",
		// /* weat	*/	"/client/weather",
		// /* KA	*/	"/client/game/keepalive",
		// /* lEn	*/	"/client/locale/en",
		// /* lRu	*/	"/client/locale/ru",
		// /* lGe	*/	"/client/locale/ge",
		// /* lFr	*/	"/client/locale/fr",
		// /* loc	*/	"/client/locations",
		// /* bot1	*/	"/client/game/bot/generate",
		// /* m1	*/	//"/api/location/develop",
		// /* m2	*/	//"/api/location/Woods",
		// /* m3	*/	//"/api/location/factory4_day",
		// /* m4	*/	//"/api/location/factory4_night",
		// /* KA	*/	//"/client/game/keepalive",
		// /* m5	*/	//"/api/location/bigmap",
		// /* m6	*/	//"/api/location/Shoreline",
		// /* m7	*/	//"/api/location/Interchange",
		// /* m8	*/	//"/api/location/RezervBase",
		// /* KA	*/	"/client/game/keepalive",
		// /* temp	*/	"/client/handbook/templates",
		// /* hbbu	*/	"/client/handbook/builds/my/list",
		// /* tcs	*/	"/client/trading/customization/storage",
		// /* slist*/	"/client/server/list",
		// /* KA	*/	"/client/game/keepalive",
		// /* metr	*/	"/client/getMetricsConfig",
		// /* quest*/	"/client/quest/list"
	];	
	// body requests
	let data = [
		// /* Auth	*/	'{"crc":0}',
		// /* mEn	*/	'{"crc":0}',
		// /* mRu	*/	'{"crc":0}',
		// /* mGe	*/	'{"crc":0}',
		// /* mFr	*/	'{"crc":0}',
		// /* val	*/	'{"version":{"major":"' + gameVersion + '", "minor":"live", "game":"live", "backend":"6", "taxonomy":"341"},"develop":true}',
		// /* KA	*/	'{}',
		// /* lang	*/	'{"crc":0}',
		// /* itm	*/	'{"crc":0}',
		// /* P_L	*/	'{}', // profile list	
		/* P_S	*/	'{"uid": "' + profileID + '"}',
		// /* gtl	*/	'{}',
		// /* gt_1	*/	'{}',
		// /* gt_2	*/	'{}',
		// /* gt_3	*/	'{}',
		// /* gt_4	*/	'{}',
		// /* gt_5	*/	'{}',
		// /* gt_6	*/	'{}',
		// /* KA	*/	'{}',
		// /* gt_7	*/	'{}',
		// /* tser	*/	'{}',
		// /* gt_8	*/	'{}',
		// /* cust	*/	'{"crc":0}',
		// /* glob	*/	'{"crc":0}',
		// /* prSt	*/	'{}',
		// /* weat	*/	'{}',
		// /* KA	*/	'{}',
		// /* lEn	*/	'{"crc":0}',
		// /* lRu	*/	'{"crc":0}',
		// /* lGe	*/	'{"crc":0}',
		// /* lFr	*/	'{"crc":0}',
		// /* loc	*/	'{"crc":0}',
		// /* WOODS */	'{"conditions":[{"Role":"assault","Limit":30,"Difficulty":"easy"},{"Role":"assault","Limit":30,"Difficulty":"normal"},{"Role":"marksman","Limit":30,"Difficulty":"normal"},{"Role":"assault","Limit":30,"Difficulty":"hard"},{"Role":"bossKojaniy","Limit":30,"Difficulty":"normal"},{"Role":"followerKojaniy","Limit":30,"Difficulty":"normal"}]}',
		// /* Default */	//'{"conditions":[{"Role":"assault","Limit":30,"Difficulty":"normal"},{"Role":"marksman","Limit":30,"Difficulty":"normal"}]}',
		// /* Customs */	//'{"conditions":[{"Role":"assault","Limit":30,"Difficulty":"easy"},{"Role":"marksman","Limit":30,"Difficulty":"normal"},{"Role":"marksman","Limit":30,"Difficulty":"easy"},{"Role":"assault","Limit":30,"Difficulty":"normal"},{"Role":"marksman","Limit":30,"Difficulty":"hard"},{"Role":"assault","Limit":30,"Difficulty":"hard"},{"Role":"bossBully","Limit":30,"Difficulty":"normal"},{"Role":"followerBully","Limit":30,"Difficulty":"normal"}]}',
		// /* Interchange */	//'{"conditions":[{"Role":"assault","Limit":30,"Difficulty":"normal"},{"Role":"assault","Limit":30,"Difficulty":"hard"},{"Role":"assault","Limit":30,"Difficulty":"easy"},{"Role":"bossKilla","Limit":30,"Difficulty":"normal"},{"Role":"followerBully","Limit":30,"Difficulty":"normal"}]}',
		// /* RESERV */	//'{"conditions":[{"Role":"assault","Limit":30,"Difficulty":"normal"},{"Role":"assault","Limit":30,"Difficulty":"hard"},{"Role":"bossGluhar","Limit":30,"Difficulty":"normal"},{"Role":"followerGluharAssault","Limit":30,"Difficulty":"normal"},{"Role":"followerGluharSecurity","Limit":30,"Difficulty":"normal"},{"Role":"followerGluharScout","Limit":30,"Difficulty":"normal"},{"Role":"pmcBot","Limit":30,"Difficulty":"normal"}]}',
		// /* m1	*/	//'{}',
		// /* m2	*/	//'{}',
		// /* m3	*/	//'{}',
		// /* m4	*/	//'{}',
		// /* KA	*/	//'{}',
		// /* m5	*/	//'{}',
		// /* m6	*/	//'{}',
		// /* m7	*/	//'{}',
		// /* m8	*/	//'{}',
		// /* KA	*/	//'{}',
		// /* temp	*/	'{}',
		// /* hbbu	*/	'{}',
		// /* tcs	*/	'{}',
		// /* slist*/	'{}',
		// /* KA	*/	'{}',
		// /* metr	*/	'{}',
		// /* quest*/	'{"completed":false}'
	];
	let err = false;
	for(let i = 0; i < path.length; i++){
		try {
			let uri = ((tradersOnly.indexOf(path[i]) == -1) ? url_prod : url_trade);
			if(path[i] == "/client/game/profile/select"){
				data[i] = '{"uid": "' + profileID + '"}';
			}

			
			let res = await send(uri, 443, path[i], data[i]);
				zlib.inflate(res, function(err, body) {
					let filename = "downloaded/" + path[i].substr(1).replace(/\//g, ".") + ".json";
					if(typeof body != "undefined"){
						body = body.toString("utf-8");
						//console.log(body);
						log.info("Profile selected!");
						AddLog("Profile selected!");
						if(data[i] != '{}' && data[i] != '{"crc":0}' && i != 0)
							console.log(data[i]);
					
						err = JSON.parse(body)['err'] != 0;
						if(err)
							console.log(JSON.parse(body)['errmsg']);
						
						util.writeJson(filename, body);
					} else {
						console.log("{undefined body !!}")
					}
				});
			await util.sleep(150);
		} catch (err) {
			console.log("[BAD] " + url_prod + path[i], err);
		}
		if(err)
			break;
	}
}

function AddLog(text){
	ipcMain.emit('add-log', text);
	log.info("Tx AddLog");
}

// export only executable function
module.exports.ClientRequests = ClientRequests;
