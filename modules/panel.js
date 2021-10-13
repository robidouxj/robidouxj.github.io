function resizePanel(obj, parent) {
		let style = obj.div.style;
		let adjX = parent.clientWidth * (obj.x/100);
		let adjY = parent.clientHeight * (obj.y/100);
		let adjWidth = parent.clientWidth * (obj.w/101);
		let adjHeight = parent.clientHeight * (obj.h/101);

		if ("makeSquare" in obj) {
			if (adjHeight > adjWidth) {
				let yOffset = (adjHeight - adjWidth)/2;
				adjHeight = adjWidth;
				adjY += yOffset;
			} else {
				let xOffset = (adjWidth - adjHeight)/2;
				adjWidth = adjHeight;
				adjX += xOffset;
			}
		}
		
		if ("transition" in obj) {
			if (obj.transition = {}) { obj.transition = "all 1s"; }
			style.transition = obj.transition;
		}

		style.left = adjX +'px';
		style.top = adjY + 'px';
		style.height = adjHeight + 'px';
		style.width = adjWidth + 'px';

		style.textAlign = obj.align;
		if(obj.bold) {style.fontWeight = 'bold';}
		let mH = adjHeight/1.163285; // default font 1.163285
		let mW = adjWidth/(.63 * obj.div.innerHTML.length); // default font .632648

		if ("fixedFont" in obj) {
			style.fontSize = obj.fixedFont;
		} else if ("textLimitHeight" in obj) {
			style.fontSize = mH + "px";
		} else if ("textLimitWidth" in obj) {
			style.fontSize = mW + "px";
		} else {
			style.fontSize = Math.min(mH,mW) + "px";
		}

}

function addPanel(obj, param) {
//	console.log(param);
	obj.div = document.createElement("div");
	let style = obj.div.style;
	
	style.position = "absolute";

	//TEXT SECTION
	/* This first condition allows sections to be reused by passing a localData
	 * property to retrieve names dynamically
	 * */
	if ("siteData" in obj && param != undefined) {
		if ("paramProperty" in obj.siteData && "returnProperty" in obj.siteData) {
			let aDev = getDeviceFromParam(obj.siteData.paramProperty,param[obj.siteData.paramProperty]);
			if (obj.siteData.returnProperty in aDev) {
				obj.div.innerHTML = aDev[obj.siteData.returnProperty];
			} else {
				console.log("Device or parameter not found. Check devices.xml and reference:",obj.siteData, param, aDev);
			}
		} else {
			console.log("paramProperty or siteProperty not found",obj.siteData);
		}
/*		} else if ("subFolder" in param) { //DEPRECATED - Saved for future reference?
			obj.div.innerHTML = param.subFolder.toUpperCase();
	} else if ("fileName" in obj) {
		obj.div.innerHTML = param.name;
*/
	} else if ("text" in obj) {
		obj.div.innerHTML = obj.text;
	}

	if ("textColor" in obj) {
		style.color = obj.textColor; 
	} else {
		style.color = "#000000";
	}
	
	//APPEARANCE SECTION
	style.backgroundRepeat="no-repeat";
	style.backgroundPosition="center";
	if ("img" in obj) {
		style.backgroundImage = 'url('+imgPath+obj.img+')';
	}
	if ("backgroundSize" in obj) {
		style.backgroundSize=obj.backgroundSize;
	}

	if ("backColor" in obj) {
		style.backgroundColor = obj.backColor; 
	}
	if ("opacity" in obj) {
		style.opacity = obj.opacity;
	}
	if (!("align" in obj)) {
		obj.align = "center";
	}
	if ("border" in obj) {
		let b = obj.border;
		if (isNumber(b.width)) { b.width = b.width+"px"; }
		style.borderWidth = b.width;
		style.borderStyle = b.style;
		style.borderColor = b.color;
	}
	if ("borderBottom" in obj) {
		style.borderBottom = obj.borderBottom;
	}
	if ("borderTop" in obj) {
		style.borderTop = obj.borderTop;
	}
	if ("borderLeft" in obj) {
		style.borderLeft = obj.borderLeft;
	}
	if ("borderRight" in obj) {
		style.borderRight = obj.borderRight;
	}
	if ("zIndex" in obj) {
		style.zIndex = obj.zIndex;
	}
	if ("scrollable" in obj) {
		style.overflowY = "scroll";
	}
	if ("tooltip" in obj) {
		//TODO
	}
	
	//Event Listeners
/*
	if ("leftClick" in obj) {
		console.log(obj,param);
		obj.div.addEventListener("click", function() {
			if ("param" in obj.leftClick) { param = obj.leftClick.param; }
			if ("this" in obj.leftClick) {
				window[obj.leftClick.fn](obj,param);
			} else {
				window[obj.leftClick.fn](param);
			}
		});
 	}
*/
	if ("leftClick" in obj) {
		obj.div.addEventListener("click", function(e) {
			let click = obj.leftClick;
			if (typeof param == "undefined") { param = {}; }
			if ("param" in click) { Object.assign(param, click.param); }
			if ("fnParent" in click) {
				window[click.fnParent][click.fn](param);
			} else if ("this" in click) {
				window[click.fn](obj,param);
			} else {
				window[click.fn](param);
			}
		});
 	}
	if ("rightClick" in obj) {
		obj.div.addEventListener("contextmenu", function(e) {
			e.preventDefault();
			if (typeof param == "undefined") { param = {}; }
			if ("param" in obj.leftClick) { Object.assign(param, obj.leftClick.param); }
			
			if ("this" in obj.leftClick) {
				window[obj.leftClick.fn](obj,param);
			} else {
				window[obj.leftClick.fn](param);
			}
		});
 	}

 	//Real-time data section
 	if ("data" in obj) {
		if ("type" in obj.data) {
			let type = obj.data.type.toLowerCase();
			if (type == "do") {
				setDO(obj,param);
			} else if (type == "ao") {
				setAO(obj,param);
			} else if (type == "chart") {
				setChart(obj,param);
			} else if (type == "calendar" || type == "calender") { //catch common misspelling
				setCalendar(obj,param);
			}
		}
	}
	return obj.div;
}


/* This function returns a string with the label used for DO
 * and AO panels. 
 * */
function getLabelFromParam(dataObj, param) {
	let oLabel = "";
	let addParam = "";
	if ("paramProperty" in dataObj) {
		if (dataObj.paramProperty in param) {
			addParam = param[dataObj.paramProperty]; // Use the paramProperty to select a property from param object
		} else {
			console.log("Error in retrieveing "+dataObj.paramProperty+" from param object");
		}
	}
	if ("label" in dataObj) {
		oLabel = dataObj.label;
	} 
	if ("prefix" in dataObj) {
		oLabel = dataObj.prefix + addParam;
	}
	if ("postfix" in dataObj) {
		oLabel += dataObj.postfix; 
	}
	return oLabel;
}	

