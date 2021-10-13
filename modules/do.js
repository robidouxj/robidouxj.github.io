/* setDO Determines the initial state, defines the variable to check, and
 * starts the loop that updates the panel based on the statusData object
 * */
function setDO(obj, param) {
	//Obj.data has to exist at this point to call function
	obj.do = getLabelFromParam(obj.data,param); //panel.js function
 	if ("initialState" in obj.data) {
		obj.state = (obj.data.initialState == "True" || obj.data.initialState == "true");
	} else {
		obj.state = false;
	}
	if ("interval" in obj.data && obj.do != "") {
		obj.dataActive = true;
		updateDO(obj, param);
	}
}


/* UpdateDO requires the statusData object to be created by dataManager. This function
 * will essentially block (asynchronous check at whatever timing is defined) until 
 * statusData is created and property exists in statusData. If the string in the do property 
 * matches a property in the statusData object, that statusData value will be used to 
 * define the state of this object (obj.state). Properties with the postfix 'On' or 'Off'
 * will then be assigned to the object based on the state. Example of DO obj:
 *<panel>
 * 		... (position, size, label, etc)
 * 		<data>
 * 			<type>DO</type>
 * 			<label>variableName<label>
 * 			<interval>300</interval>
 * 			<backColorOn>green</backColorOn>
 * 			<backColorOff>red</backColorOff>
 * 		</data>
 * </panel>
 * */
function getBool(value) {
	let oState = null;
	if (typeof value == "string") {
		let lCase = value.toLowerCase();
		oState = (lCase == "true" || lCase == "t" || lCase == "1" ); //t,T,true,True,TRUE,1
	} else if (typeof value == "number"){
		oState = (value == 1); //This would auto-convert so it's technically not necessary, but added as a best practice.
	} else if (typeof value == "boolean"){
		oState = value;
	}
	return oState;
}
function setByState(obj,param,state) {
		if ("img"+state in obj.data) {
			obj.div.style.backgroundImage = 'url('+obj.data["img"+state]+')';
		}
		if ("text"+state in obj.data) {
			obj.div.innerHTML = obj.data["text"+state];
		}
		if ("backColor"+state in obj.data) {
			obj.div.style.backgroundColor = obj.data["backColor"+state];
		}
		if ("spacial"+state in obj.data) {
			obj.x = obj.data["spacial"+state].x;
			obj.y = obj.data["spacial"+state].y;
			obj.w = obj.data["spacial"+state].w;
			obj.h = obj.data["spacial"+state].h;
			resizeOverride();
		}
		if ("opacity"+state in obj.data) {
			obj.div.style.opacity = obj.data["opacity"+state];
		}
		if ("audio"+state in obj.data) {
			if (obj.lp != obj.state) {
				playArray(obj.data["audio"+state], param);
			}
		}

}
function updateDO(obj, param) {

	obj.lp = obj.state;
	let aValue = getValue(obj.do);
	obj.state = getBool(getValue(obj.do));

	if (obj.state) {
		setByState(obj,param,"On")
	} else if (obj.state != null) {
		setByState(obj,param,"Off")
	} 
	
	if (obj.state == null && "hideIfNoData" in obj) {
		obj.div.style.opacity = 0;
	} else if ("opacity" in obj) {
		obj.div.style.opacity = obj.opacity;
	} else {
		obj.div.style.opacity = 1;
	}

	if (obj.dataActive) {
		let t = setTimeout(function(){updateDO(obj);}, obj.data.interval);
	}
}

