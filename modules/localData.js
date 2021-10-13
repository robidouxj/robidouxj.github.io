var siteData = {ready:false};

function getSiteParam(paramName) {
	return siteData.data[paramName];
}

function getLocalData(file) {
	getXML(xmlPath+file, function(data){
		parseLocalData(JSON.parse(data));
	});
}

/* Unused at this time (for possible future modification?)
 * 
 * function promptLogin() {
	let d = siteData.data;
	loginPrompt(d.verifyFile, d.verifyPath, function(data) {
//	console.log(data);
	checkLogin();
	});
}

function checkLogin(){
	let d = siteData.data;
	if ("verifyFile" in d && "verifyPath" in d) {
		loginVerify(d.verifyFile, d.verifyPath, function(data) {
			console.log(d);
			parseLoginVerify(data);
		});
	}
}
*/

function parseLocalData(obj) {
	let dValid = (typeof obj.switchIP != "undefined");
	dValid = dValid && (typeof obj.switchPrompt != "undefined");
	dValid = dValid && (typeof obj.devices != "undefined");
	if (typeof obj.devices.device[0] == "undefined") { obj.devices.device = [obj.devices.device]; } // catch single item fail

	siteData.data = obj;
	siteData.ready = true;
//	checkLogin();
	
}
function getDeviceFromParam(param, value) {
	let oDevice = {}
	for (let i=0; i<siteData.data.devices.device.length; i++) {
		let d = siteData.data.devices.device[i];
		if (value == d[param]) { oDevice = d; } 
	}
	return oDevice;
}

/* DEPRECATED
   function getDeviceFromJob(jobNo){
	let oDevice = {}
	for (let i=0; i<siteData.data.devices.device.length; i++) {
		let d = siteData.data.devices.device[i];
		if (jobNo == d.jobNumber) { oDevice = d; } //Gets device index based on job number
	}
	return oDevice;
}
* */
function isDataReady(){
	return siteData.ready
}

	
