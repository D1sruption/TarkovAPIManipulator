const ipcMain = require('electron').ipcMain;
const settings = require('electron-settings');
const log = require('electron-log');

require('./globals.js');

var email = settings.get('Profile.email');
var password = settings.get('Profile.password');
var access_token = settings.get('Profile.access_token');
var hwCode = settings.get('Profile.hwCode');

var GameMajorVersion = settings.get('GameConstants.GameMajor')

const paths = [
	/* 0	*/ "/launcher/token/refresh",
	/* 1	*/ "/launcher/hardwareCode/activate",
	/* 2	*/ "/launcher/logout",
	/* 3	*/ "/launcher/login",
	/* 4	*/ "/launcher/queue/status",
	/* 5	*/ "/launcher/game/start",
	/* 6	*/ "/launcher/analytics",
	/* 7	*/ "/launcher/config",
	/* 8	*/ "/launcher/setDataCenters",
	/* 9	*/ "/launcher/dataCenter/list",
	/* 10	*/ "/launcher/server/list",
	/* 11	*/ "/launcher/GetUnpackedDistrib?version={yourgameversion}",
	/* 12	*/ "/launcher/GetPatchList",
	/* 13	*/ "/launcher/GetLauncherDistrib",
	/* 14	*/ "/launcher/GetDistrib",
	/* 15   */ "/client/game/profile/select"
]

/* **** LOGIN FUNCTION **** */
//login->get access_token->send game start request->get session_token->send profile select->???->profit
function send_launcherlogin(url, _port = 443, path, data){
	//log.info(data);
	return new Promise ((resolve, reject) => {
		const options = { // options for https data it must stay like this
		  hostname: url,
		  port: _port,
		  path: path,
		  method: 'POST',
		  headers: {
			  'User-Agent':			'BSG Launcher ' + settings.get('GameConstants.LauncherVersion'),
			  'Content-Type': 		'application/json',
			  'Method': 			'POST'
		  } 
		};
		zlib.deflate(data, function (err, buffer) { // this is kinda working
			const req = http.request(options, (res) => { // request https data with options above
				// check if PHPSESSID isnt setted already - for more then 1 request
				if(PHPSESSID == '') 
					PHPSESSID = res.headers['set-cookie'][1].replace("; path=/", "").replace("PHPSESSID=","cdb0a9903e6c68e7743a15fd3482bc04"); // properly grab PHPSESSID from server
					log.info("PHPSESSID COOKIE: " + PHPSESSID);
				if(L_TOKEN == '')
					L_TOKEN = '';
					// display whats going on
				log.info("[URL] " + path + " [StatusCode]" + res.statusCode);

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

function request_session(url, _port = 443, path, data){
	return new Promise ((resolve, reject) => {
		const options = { // options for https data it must stay like this
		  hostname: url,
		  port: _port,
		  path: path,
		  method: 'POST',
		  headers: {
			  'User-Agent':			'BSG Launcher ' + settings.get('GameConstants.LauncherVersion'),
			  'Content-Type': 		'application/json',
			  'Method': 			'POST',//,
			  'Authorization': 		settings.get('Profile.access_token')
		  } 
		};
		zlib.deflate(data, function (err, buffer) { // this is kinda working
			const req = http.request(options, (res) => { // request https data with options above
				// check if PHPSESSID isnt setted already - for more then 1 request
				if(PHPSESSID == '') 
					PHPSESSID = res.headers['set-cookie'][2].replace("PHPSESSID=","PHPSESSID=cdb0a9903e6c68e7743a15fd3482bc04"); // properly grab PHPSESSID from server
				if(L_TOKEN == '')
					L_TOKEN = '';
					// display whats going on
				log.info("[URL] " + path + " [StatusCode]" + res.statusCode);

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

function select_profile(url, _port = 443, path, data){
	return new Promise ((resolve, reject) => {
		const options = { // options for https data it must stay like this
		  hostname: url,
		  port: _port,
		  path: path,
		  method: 'POST',
		  headers: {
			  'User-Agent':	settings.get('GameConstants.UnityPlayerVersion'),
			  'Accept-Encoding': 'identity',
			  'Accept': 'application/json',
			  'Content-Type': 'application/json',
			  'App-Version': settings.get('GameConstants.AppVersion'),
			  'GClient-RequestId': 8,
			  'X-Unity-Version': settings.get('GameConstants.XUnityVersion'),
			  'Method': 'POST'
		  }
		};

		zlib.deflate(data, function (err, buffer) { // this is kinda working
			const req = http.request(options, (res) => { // request https data with options above
				// check if PHPSESSID isnt setted already - for more then 1 request
				if(PHPSESSID == '') 
					PHPSESSID = res.headers['set-cookie'][2].replace("PHPSESSID=","PHPSESSID=cdb0a9903e6c68e7743a15fd3482bc04"); // properly grab PHPSESSID from server
				if(L_TOKEN == '')
					L_TOKEN = '';
					// display whats going on
				log.info("[URL] " + path + " [StatusCode]" + res.statusCode);
				log.info(req);
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

/* **** MAIN EXECUTABLE FUNCTION **** */
async function LauncherRequests(){
	let path = paths;

	InternalRequest_LauncherLogin(url_launcher, path[3], settings.get('RequestData.login'));

	setTimeout(() => {
		InternalRequest_SessionToken(url_prod, path[5], settings.get('RequestData.startGame'))
	}, 3000)

	ipcMain.on('select-profile', () => {
		log.info('Rx select_profile');
		setTimeout(() => {
			log.info("\nSending ProfileSelect with data:\n " + settings.get('RequestData.selectProfile') + "\n");
			InternalRequest_SelectProfile(url_prod, path[15], settings.get('RequestData.selectProfile'))
		}, 2000);
	})

}

/* **** SEPARATE URL RESOLVER FUNCTION **** */
async function InternalRequest_LauncherLogin(launcher_url, path, data){
	let res = await send_launcherlogin(launcher_url, 443, path, data);;

	let body = await zlibBody(res, path);

	setAccessToken(body);
}

async function InternalRequest_SessionToken(prod_url, path, data){
	let res = await request_session(prod_url, 443, path, data);;

	let body = await zlibBody(res, path);

	setSessionToken(body);

	log.info(JSON.parse(body));
}

async function InternalRequest_SelectProfile(prod_url, path, data){
	let res = await select_profile(prod_url, 443, path, data);;

	let body = await zlibBody(res, path);

	log.info(JSON.parse(body));
}

/* **** BODY_DEFLATE FUNCTION **** */
function zlibBody(res, path){
	return new Promise( function( resolve, reject ) {
		zlib.inflate(res, function(err, buffer) {
			if(err){
				log.info("Error with inflate:");
				reject(err);
			}
			resolve(buffer);
		});
	});
}

function setAccessToken(data) {
	let path = paths;

	var jsonData = JSON.parse(data);
	var at = jsonData.data.access_token;

	//set settings
	settings.set('Profile.access_token', at);

	log.info("Received access_token. Grabbing session_token...")
}

function setSessionToken(data) {
	var jsonData = JSON.parse(data);
	var st = jsonData.data.session;

	settings.set('Profile.session_token', st);

	log.info("\nReceived session_token:");
	log.info(settings.get('Profile.session_token') + '\n');

	ipcMain.emit('select-profile');
}

// export only executable function
module.exports.LauncherRequests = LauncherRequests;
