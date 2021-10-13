defaultInterval = 300;

function setAO(obj, param) {
	obj.ao = getLabelFromParam(obj.data, param); //panel.js function
	if (!("interval" in obj.data)) {obj.data.interval = defaultInterval;}
	if (obj.ao != "") {
		obj.dataActive = true;
		updateAO(obj, param);
	} 
	
	return obj.div;
}

function updateAO(obj, param) {
	if (isLabel(obj.ao)) {
		let lp = obj.value;
		obj.value = getValue(obj.ao);
		
		if (obj.data.fn) { //This may be deprecated...
			obj.value = window[obj.data.fn](obj.value); //Perform function on raw value if applicable
		}
		if (!("noText" in obj.data)) {
			let oVal = obj.value;
			if ("roundDown" in obj.data) {
				oVal = Math.floor(obj.value);
			} else if ("roundUp" in obj.data) {
				oVal = Math.ceil(obj.value);
			}
			obj.div.innerHTML = oVal; 
		}
		if ("hideIfNoValue" in obj) {
			if ("opacity" in obj) {
				obj.div.style.opacity = obj.opacity;
			} else {
				obj.div.style.opacity = 1;
			}
		}
		if ("conditions" in obj.data) {
			checkConditions(obj, param);
		}
		if ("display" in obj.data) {
			variableDisplay(obj, param);
		}
	} else if ("hideIfNoValue" in obj) {
		obj.div.style.opacity = 0;
	}

	if (obj.dataActive) {
		let t = setTimeout(function(){updateAO(obj);}, obj.data.interval);
	}
}
	
 function checkConditions(obj, param) {
	let value = Number(obj.value);
	// This allows a different value to control conditional formatting
	let label = getLabelFromParam(obj.data.conditions,param);
	value = Number(getValue(obj.ao)); //dependency: getValue in datamanager.js

	let conditions = checkArray(obj.data.conditions,"condition");
	for (let i=0; i<conditions.length; i++) {
		let condition = conditions[i];
		if ("comparator" in condition) {
			let valueB = null;
			let valueC = null;
			if (condition.comparator == "between" && "min" in condition && "max" in condition) {
				valueB = Number(condition.min);
				valueC = Number(condition.max);
			} else if ("value" in condition) {
				valueB = Number(condition.value);
			}
			if (condition.comparator in compare && valueB != null) {
//				console.log(value, condition.comparator, valueB, compare[condition.comparator](value,valueB));
				if (compare[condition.comparator](value,valueB,valueC)) {
					setDivProperties(obj, condition); 
					if ("audioCue" in condition && obj.count < 1) {
						playArray(condition.audioCue, "noParam")
						if ("audioInterval" in obj.data.conditions) {
							obj.count = obj.data.conditions.audioInterval;
						} else {
							obj.cont = 0;
						}
					}
				} 
			}
		}
	}
	if (obj.count > 0){ obj.count -= 1; } //Decrement for audio interval
}

function setDivProperties(obj, cond){
	let style = obj.div.style;
	if ("backColor" in cond) {
		style.backgroundColor = cond.backColor;
	}
	if ("textColor" in cond) {
		style.color = cond.textColor;
	}
	if ("img" in cond) {
		style.backgroundImage = 'url('+imgPath+cond.img+')';
	}
	if ("opacity" in cond) {
		style.opacity = cond.opacity;
	}
	if ("zIndex" in cond) {
		style.zIndex = cond.zIndex;
	}
}

function variableDisplay(obj, param) {
	let vMin = 0;
	let vMax = 100;
	if (isLabel(obj.ao+"Min")) { vMin = Number(getValue(obj.ao+"Min")); }
	if (isLabel(obj.ao+"Max")) { vMax = Number(getValue(obj.ao+"Max")); }
	let perc = Math.abs((obj.value - vMin)/(vMax-vMin) * 100);
	if (obj.data.display == "HLBar") {
		obj.w = perc;
		obj.h = 100;
	} else if (obj.data.display == "HRBar") {
		obj.w = perc;
		obj.x = 100- perc;
		obj.h = 100;
	} else if (obj.data.display == "VTBar") {
		obj.w = 100;
		obj.h = perc;
	} else if (obj.data.display == "VBBar") {
		obj.w = 100;
		obj.h = perc;
		obj.y = 100- perc;
	} else if (obj.data.display == "opacity") {
		obj.div.style.opacity = perc/100;
	}
	if ("resize" in obj) {obj.resize()};
}
