const settings = require('electron-settings');
const log = require('electron-log');

//initialize profile settings
settings.set('Profile.email', "NotAssassinNite");
settings.set('Profile.password', "863e1650b6cd0d0203f14a62629eae67");
settings.set('Profile.hwCode', "hwCode=#1-edde17c081b71782bb7658467b7e1699e1ac7cb3:1ff7d0c4414ad0ceda09011f1ed21fc5528d2922:1d43cc9d2fa1a6445da1990e72823c679959a23e-09b55fbb89fec743bc1c758e9c7d63c31646163b-0acfcae9cfb8b3b08299d2bf5368f8be23c1844b-0f503c52b46776b89146855c63b26b5f3c7489e7-9f8203df140f812c5d525777f76e0efd8dd0d20f-7296d4237ecba9f454ff79dd7275d456");
settings.set('Profile.uid', "5df78c2987ba573dcd7dc077");
settings.set('Profile.PHPSESSID', 't5nbfudkl0xi0e52xg77u365qhumprs7');

//initialize game constants
settings.set('GameConstants.GameMajor', "0.12.3.5834");
settings.set('GameConstants.UnityPlayerVersion', "UnityPlayer/2018.4.13f1 (UnityWebRequest/1.0, libcurl/7.52.0-DEV)");
settings.set('GameConstants.LauncherVersion', "0.9.3.1011");
settings.set('GameConstants.XUnityVersion', "2018.4.13f1");
settings.set('GameConstants.AppVersion', "EFT Client 0.12.3.5834");

//initialize HTTP request data
let loginData = JSON.stringify({
	email: settings.get('Profile.email'),
	pass: settings.get('Profile.password'),
	hwCode: settings.get('Profile.hwCode'),
	captcha: "null"
});

let startGameData = JSON.stringify({
	version: {
		major: settings.get('GameConstants.GameMajor'),
		game: "live",
		backend: "6"
	},
	hwCode: settings.get('Profile.hwCode')
});

let select_profileData = JSON.stringify({
    uid: settings.get('Profile.uid')
});

//log.info(JSON.stringify(select_profileData));

settings.set('RequestData.login', loginData);
settings.set('RequestData.startGame', startGameData);
settings.set('RequestData.selectProfile', select_profileData);

//=====================================================
// main libraries
global.request 	= require('request');
global.fs		= require('fs');
global.zlib 	= require('zlib');
global.http 	= require('https');
//=====================================================
// global variables to change
global.gameVersion 		= ''; // should be auto updated
global.launcherVersion 	= ''; // should be auto updated
global.PHPSESSID 		= 't5nbfudkl0xi0e52xg77u365qhumprs7'; // this need to be empty it will updated by script
global.url_launcher 	= "launcher.escapefromtarkov.com"; 	// launcher backend
global.url_prod 		= "prod.escapefromtarkov.com";		// game backend
global.url_trade 		= "trading.escapefromtarkov.com";	// trading backend
global.url_ragfair 		= "ragfair.escapefromtarkov.com";	// ragfair backend (not sure if im not done any typo there)
global.userAgent 		= settings.get('GameConstants.UnityPlayerVersion'); // take that in mind to update it from time to time
global.backendVersion 	= '6';
global.taxonomyVersion 	= '341';
////////// 
global.integer = 0; 		// incrementor used to not get banned ? who fucking knows
global.cookieString = ''; 	// not use ?
global.L_TOKEN = ''; 		// not use ?
global.profileID = settings.get("Profile.uid"); 		// your profile ID you should update it after login to game
global.language = 'en'; 	// not use ?
//=====================================================
// Local Script files
global.util 		= require('./utility.js');
global.launcher_f 	= require('./_launcher.js');
global.client_f 	= require('./_client.js');