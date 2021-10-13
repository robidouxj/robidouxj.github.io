var creatures = {};
var activeCreature = {ready: false};

//Actions are functions that cause effects
function addAction(creature, action) {
	if ("name" in action && "effect" in action) {
		creature[action.name] = function() {
			if (notPaused(creature)) {
				if ("trigger" in action) {
					let triggers = checkArray(action,"trigger");
					if (checkTriggers(creature, triggers)) { 
						effects = checkArray(action,"effect");
					} else if ("effectFalse" in action) {
						effects = checkArray(action,"effectFalse");
					}				
					setEffects(creature,effects);
				} else {
					let effects = checkArray(action,"effect");
					setEffects(creature,effects);
				}
			}
		}
	}
}


//Affects are a set of conditions that cause a set of effects
function addAffect(creature, affect) {
	if ("trigger" in affect && "effect" in affect) {
		//console.log(affect);
		let affectAction = function() {
			if (notPaused(creature)) {
				let triggers = checkArray(affect,"trigger");
				if (checkTriggers(creature, triggers)) { //if affected is still true and at least one compare happened
					let effects = checkArray(affect,"effect");
					setEffects(creature, effects);
				} else if ("effectFalse" in affect) {
					effects = checkArray(affect,"effectFalse");
					setEffects(creature, effects);
				}
			}
			setTimeout(affectAction,creature.tick);
		}
		affectAction();
	}
}

//Effects are effects that occur per tick
function addEffects(creature,effects){
	let tickEffects = function () {
		if (notPaused(creature)) { setEffects(creature, effects); }
		setTimeout(tickEffects,creature.tick);
	};
	tickEffects();
}

/*function checkProperty(creature, prop, loop=false) {
	if (creature[prop] > creature[prop+"Max"]) { creature[prop] = creature[prop+"Max"]; }
	if (creature[prop] < creature[prop+"Min"]) { creature[prop] = creature[prop+"Min"]; }
	if (creature.enabled && loop) {setTimeout(function() {checkProperty(creature, prop);},1000);}	
}
* */


function getCreatures(file){ //reads the creature object
	getXML(xmlPath+file , function(data){
		let obj = JSON.parse(data);
		let cObj = checkArray(obj,"creature");
		let firstCreature = true;
		for (let i=0; i<cObj.length; i++) {
			if ("type" in cObj[i] && "xml" in cObj[i]) {
				creatures[cObj[i].type] = {ready: false, enabled:true, paused: false};
				if (firstCreature) { //Set the first creature as active
					firstCreature = false;
					activeCreature = creatures[cObj[i].type];
				}
				getXML(xmlPath+cObj[i].xml, function(data) {
					parseCreature(JSON.parse(data),creatures[cObj[i].type]);
				});
			}
		}
	});
}

function parseCreature(obj, creature) { //parses XML and starts data collection
	for (prop in obj) { 
		if (typeof obj[prop] == "object") {
			if (prop == "effects") {
				let effects = checkArray(obj[prop],"effect");
				addEffects(creature,effects);
			} else if (prop == "actions") {
				let actions = checkArray(obj[prop],"action");
				for (let i=0; i<actions.length; i++) {
					addAction(creature,actions[i]);
				}
			} else if (prop == "affects") {
				let affects = checkArray(obj[prop],"affect");
				for (let i=0; i<affects.length; i++) {
					addAffect(creature,affects[i]);
				}
			} else if ("start" in obj[prop]){
				creature[prop] = Number(obj[prop].start);
				if ("min" in obj[prop]) {
					creature[prop+"Min"] = Number(obj[prop].min);
				} else {
					creature[prop+"Min"] = 0;
				} 
				if ("max" in obj[prop]) {
					creature[prop+"Max"] = Number(obj[prop].max);
				} else {
					creature[prop+"Max"] = 100;
				} 
				//checkProperty(creature, prop, true); //Check for min and max value - set this check to loop
			}
			
		} else {
			creature[prop] = obj[prop];
			if (isNumber(obj[prop])) {
				creature[prop+"Min"] = 0;
				creature[prop+"Max"] = 100;
			checkProperty(creature, prop);
			}
		}
		//console.log(creature);
	}
	creature.ready = true //creature specific ready
	creatureRdy = true //global ready sets when any 1 creature is loaded
}

function isLabel(label) { return label in activeCreature; }

function getValue(label) {
	oValue = null;
	if (label in activeCreature) { 
		//checkProperty(activeCreature,label);
		oValue = activeCreature[label]; 
	}
	return oValue;
}

function isDataReady() { //Return ready if activeCreature is assigned and ready
	oRdy = false; 
	if ("ready" in activeCreature) { oRdy = activeCreature.ready; } 
	return oRdy;
}

