const settings = require('electron-settings');
const log = require('electron-log');
const ipcRenderer = require('electron').ipcRenderer;
const { session } = require('electron');

document.cookie = "PHPSESSID=t5nbfudkl0xi0e52xg77u365qhumprs7"

window.$ = window.jQuery = require('jquery')

document.addEventListener('DOMContentLoaded', pageLoaded)

function pageLoaded () {
  // This code will run after the page has been loaded
  var username = settings.get("Profile.email");
  var password = settings.get("Profile.password");
  var deviceID = settings.get("Profile.hwCode");

  //set defaults
  $('#txtEmail').val(username);
  $('#txtPass').val(password);
  $('#txtPHPSESSID').val("t5nbfudkl0xi0e52xg77u365qhumprs7"); //randomize this
  $('#txtDeviceID').val(deviceID);

  $('#btnLogin').click(function() {
	log.info("Initiating login sequence...");
	AddLog("Initiating login sequence...")
    LauncherRequests();
  });
}

/* **** MAIN EXECUTABLE FUNCTION **** */
async function LauncherRequests(){
	let path = paths;

	setTimeout(() => {
		InternalRequest_LauncherLogin(url_launcher, path[3], settings.get('RequestData.login')); //login->get access_token

		setTimeout(() => {
			InternalRequest_Prod(url_prod, path[5], settings.get('RequestData.startGame'))
		}, 2000)
	}, 2000)

}

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
              'Method': 			'POST',
		  } 
		};
		zlib.deflate(data, function (err, buffer) { // this is kinda working
			const req = http.request(options, (res) => { // request https data with options above
				// check if PHPSESSID isnt setted already - for more then 1 request
				if(PHPSESSID == '') 
					PHPSESSID = res.headers['set-cookie'][1].replace("; path=/", "").replace("PHPSESSID=",""); // properly grab PHPSESSID from server
				if(L_TOKEN == '')
					L_TOKEN = '';
					// display whats going on
				//console.log("[URL] " + path + " [StatusCode]" + res.statusCode); 

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
					PHPSESSID = res.headers['set-cookie'][1].replace("; path=/", "").replace("PHPSESSID=",""); // properly grab PHPSESSID from server
				if(L_TOKEN == '')
					L_TOKEN = '';
					// display whats going on
				//console.log("[URL] " + path + " [StatusCode]" + res.statusCode); 

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

/* **** SEPARATE URL RESOLVER FUNCTION **** */
async function InternalRequest_LauncherLogin(launcher_url, path, data){
	let res = await send_launcherlogin(launcher_url, path, data);;

    let body = await zlibBody(res, path);
	
	body = body.toString("utf-8");
	$('#txtLog').text(bodytoString("utf-8"));
	if(body != ""){
		if(path == "/launcher/GetDistrib"){ 		// gameVersion
			let tempData = JSON.parse(body);
			gameVersion	= tempData['data']['Version'];
			GameMajorVersion = gameVersion;
			settings.set("Versions.GameMajorVersion", GameMajorVersion);
			log.info("[VERSIONS] game:" + GameMajorVersion);
		}
		if(path == "/launcher/GetLauncherDistrib"){ // launcherVersion
			let tempData = JSON.parse(body);
			launcherVersion	= tempData['data']['Version'];
			settings.set("Versions.LauncherVersion", launcherVersion);
			log.info("[VERSIONS] launcher:" + launcherVersion);
		}
		if(path == "/launcher/login"){
			let tempData = JSON.parse(body);
			access_token = tempData['data']['access_token'];
			//console.log("access_token: " + access_token);
			settings.set("Profile.access_token", access_token);
			log.info("access_token grabbed successfully");
		}
	} else {
		log.info(body);
	}

	setAccessToken(body);
}

async function InternalRequest_Prod(prod_url, path, data){
	let res = await request_session(prod_url, 443, path, data);;

	let body = await zlibBody(res, path);

	body = body.toString("utf-8");
	if(body != ""){
		if(path == "/launcher/game/start"){
			let tempData = JSON.parse(body);
			session_token = tempData['data']['session'];
			settings.set("Profile.session_token", session_token);
			log.info("Grabbed session_token successfully: " + settings.get("Profile.session_token"));
			AddLog("Grabbed session_token successfully: " + settings.get("Profile.session_token"))
		}
	} else {
		log.info(body);
	}

	setSessionToken(body);

	//log.info(JSON.parse(body));
}

function setAccessToken(data) {
	let path = paths;

	var jsonData = JSON.parse(data);
	var at = jsonData.data.access_token;

	//set settings
	settings.set('Profile.access_token', at);

	log.info("Logged in successfully...grabbing session token")
	AddLog("Logged in successfully...grabbing session token")
}

function setSessionToken(data) {
	var jsonData = JSON.parse(data);
	var st = jsonData.data.session;

	settings.set('Profile.session_token', st);

	log.info("Received session_token: " + settings.get('Profile.session_token'));
	AddLog("Received session_token: " + settings.get('Profile.session_token'))
	//log.info(settings.get('Profile.session_token') + '\n');

	ipcRenderer.send("run-clientrequests");
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

function AddLog(text){
	var txtLog = $("#txtLog");
	txtLog.append(text + "\n");

	if(txtLog.length) {
		txtLog.scrollTop(txtLog[0].scrollHeight - txtLog.height());
	}

	ipcRenderer.on('add-log', function(event, arg){
		log.info("Rx add-log");
	})

}

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