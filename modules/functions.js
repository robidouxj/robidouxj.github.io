var compare = {};
compare["gt"] = function (a,b) { return a>b; };
compare["ge"] = function (a,b) { return a>=b; };
compare["lt"] = function (a,b) { return a<b; };
compare["le"] = function (a,b) { return a<=b; };
compare["eq"] = function (a,b) { return a==b; };
compare["ne"] = function (a,b) { return a!=b; };
compare["between"] = function (a,b,c) { 
	console.log(a,b,a>b,a,c,a>c);
	return (a>b && a<c); 
};

var operate = {};
operate["+"] = function (a,b) { return a+b; };
operate["-"] = function (a,b) { return a-b; };
operate["*"] = function (a,b) { return a*b; };
operate["/"] = function (a,b) { return b!=0 ? a*b : null; }
operate["="] = function (a,b) { return b };

function checkArray(obj,arrName) { //Checks if property exists and if the propery is a single item. Returns an array.
	let oArr = [];
	if (arrName in obj) {
		if (typeof obj[arrName][0] == "undefined") { 
			oArr = [obj[arrName]];
		} else {
			oArr = obj[arrName];
		}
	}
	return oArr;
}
function togglePause() { //Pause can't be a dynamically created function as it will pause itself
	activeCreature.paused = !activeCreature.paused;
}

function toggleSpeed() {
	if (activeCreature.tick > 500) {
		activeCreature.tick /= 2;
	} else {
		activeCreature.tick = 2000;
	}
}

function notPaused(obj) {
	let oReturn = true;
	if ("paused" in obj) { oReturn = !obj.paused; }
	return oReturn;
}
function checkProperty(obj, prop, loop=false) {
	if (prop in obj && prop+"Max" in obj && prop+"Min" in obj) {
		obj[prop] = Math.min(Number(obj[prop]), Number(obj[prop+"Max"]));
		obj[prop] = Math.max(Number(obj[prop]), Number(obj[prop+"Min"]));
	}
	if (obj.enabled && loop) {setTimeout(function() {checkProperty(obj, prop);},1000);}	
}

function getLabelPercent(obj, prop) {
	let oVal = 0;
	if (prop in obj && prop+"Max" in obj && prop+"Min" in obj) {
		oVal = (Number(obj[prop])-Number(obj[prop+"Min"])) / (Number(obj[prop+"Min"])+Number(obj[prop+"Max"]));
	}
	return oVal;
}

// Takes an array of trigger objs, checks them against a data obj, and returns true/false
// Result uses AND logic with all triggers
function checkTriggers(obj, triggers) {
	let affected = true;
	let didCompare = false;
	if (typeof triggers == "object" && triggers.length > 0){
		for (let i=0; i<triggers.length; i++) {
			let trigger = triggers[i];
			if ("property" in trigger && "comparator" in trigger && "value" in trigger) {
				if (trigger.comparator in compare && trigger.property in obj) {
					obj[trigger.property] = Number(obj[trigger.property]);
					trigger.value = Number(trigger.value);
					affected = (compare[trigger.comparator](obj[trigger.property],trigger.value) && affected);
					didCompare = true; //Set to show comparison ran at least once
				}
			}
		}
	}
	return (affected && didCompare);
}
//Takes an array of effect objs and activates those effects on a data obj
function setEffects(obj, effects) {
	for (let i=0; i<effects.length; i++) {
		let effect = effects[i];
		if ("property" in effect && "value" in effect) {
			let operator = "+";
			if ("operator" in effect) {
				if (effect.operator in operate) { operator = effect.operator; }
			}
			if (effect.property in obj) {
				obj[effect.property] = Number(obj[effect.property]);
				effect.value = Number(effect.value);
				let scaling = 1;
				if ("label" in effect) {
					if (effect.label in obj) {
						scaling = getLabelPercent(obj, effect.label);
					}
					if ("invert" in effect) {
						scaling = 1-scaling ;
					}
				}
				obj[effect.property] = operate[operator](obj[effect.property],effect.value*scaling);
				checkProperty(obj,effect.property); // Check for min/max
			}
		}
	}

}

function isNumber(aStr){
	return ((aStr.charAt(0) >= '0' && aStr.charAt(0) <= '9') || (aStr.charAt(0) == "-"));
}

