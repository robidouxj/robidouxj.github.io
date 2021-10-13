xmlPath = "../xml/";
imgPath = "../img/";
function setxmlPath(path) { xmlPath = path;}
function setimgPath(path) { imgPath = path;}

var forceResize = false; //Is this still needed? This label forces a resize even if document body doesn't change

/* An XML Page is an object with a set of recursive properties used to build a html page layout
 * getPageFromXML uses an asynchronous AJAX function getXML along with getXMLFile.php
 * to retrieve this object and pass it to a parser. [The param object is not required]
 * */
function getPageFromXML(file,param={}) {
	getXML(xmlPath+file, function(data){
		parsePageLayout(JSON.parse(data), param);
	});
}
/* This parser associates the page object with the document body then calls the recursive function
 * getChildren to build a html page based on the objects properties
 * */
function parsePageLayout(obj, param) {
	if (!isDataReady()) {
		setTimeout(function(){parsePageLayout(obj, param);},100);
	} else {
		obj.div = document.body; //Links the div for this object to the document.body so it can be referenced later as a parent
		obj.isActive = true;
		obj.bodyWidth = 0;
		obj.bodyHeight = 0; 
		getChildren(obj, param); //Starts a recursive check of properties of this object to build objects that will display within the body.
		checkResize(obj); //Starts a loop that checks if the body size is changed every 200ms
	}
}

/* An XML Section is an object with a set of recursive properties used to append a html page layout
 * getSectionFromXML uses an asynchronous AJAX function getXML along with getXMLFile.php
 * to retrieve this object. It then attaches this object to the page object and passes it to a parser.
 * */
function getSectionFromXML(file, parent, param) {
	getXML(xmlPath+file, function(data){
		parseSectionLayout(JSON.parse(data), parent, param);
	});
}
function parseSectionLayout(obj, parent, param) {
	Object.assign(parent, obj);
	getChildren(parent, param);
}

/* Overlays are added to the document body. Example of xml call to this function:
 * <panel>
 * 		... (position, size, label, etc)
 * 		<leftClick>
 * 			<fn>addOverlay</fn>
 * 			<param>
 * 				<xmlFile>overlay.xml</xmlFile>
 * 				<otherParam></otherParam>
 * 			</param>
 * 		</leftClick>
 * </panel>
 * */
function addOverlay(param) { 
	if("xmlFile" in param) {
		getPageFromXML(param.xmlFile);
	} else {
		console.log("XML filename missing from overlay param");
	}
}

function getChildren(parent, param){
	if ("panel" in parent) {
		parent.panel = checkArray(parent,"panel");
//		if (typeof parent.panel[0] == "undefined") { parent.panel = [parent.panel]; } // catch single item fail
		for (let i=0; i<parent.panel.length; i++) {
			let aPanel = parent.panel[i];
			aPanel.div = addPanel(aPanel, param);
			aPanel.isActive = true;
			parent.div.appendChild(aPanel.div);
			aPanel.getParentObj = function() { return parent; }
			aPanel.resize = function() {resizePanel(aPanel, parent.div);}
			aPanel.resize();
			getChildren(aPanel, param)
			if ("section" in aPanel) {
				if ("param" in aPanel.section) { param = aPanel.section.param;	}
				if (aPanel.section.source != undefined) {
					getSectionFromXML(aPanel.section.source, aPanel, param);
				}
			}
		}
	}
}

function resizeOverride(){
	forceResize = true;
}

function checkResize(parent){
	if (parent.isActive) { // Resize should stop when overlays are closed
		if (document.body.clientHeight != parent.bodyHeight || document.body.clientWidth != parent.bodyWidth || forceResize) {
			forceResize= false;
			resizeObjects(parent);
			parent.bodyHeight = document.body.clientHeight;
			parent.bodyWidth = document.body.clientWidth;
		}
		let t = setTimeout(function(){checkResize(parent);}, 200);
	}
}
function resizeObjects(parent) {
	if ("panel" in parent) {
		for (let i=0; i<parent.panel.length; i++) {
			resizePanel(parent.panel[i], parent.div);
			resizeObjects(parent.panel[i]);
		}
	}
}	
/* Use exitPanel function with an overlay panel. Add to a opacity 0 panel with a
 * zIndex lower than the rest of the overlay (but above the main page layout).
 * 'this' property allows access to object parent. Without 'this', the parent
 * won't be retrieved and only objects within this structure will close.
 * example:
<panel>
	<desc>This is an invisble panel used to close overlays</desc>
	<x>0</x>
	<y>0</y>
	<w>100</w>
	<h>100</h>
	<zIndex>10</zIndex>
	<opacity>0</opacity>
	<leftClick>
		<fn>exitPanel</fn>
		<this></this>
	</leftClick>
</panel>
 * 
 * */
function exitPanel(obj) {
	let parent = obj;
	if ("getParentObj" in obj) {
		parent = obj.getParentObj();
	} else {
		console.log("getParentObj not found for obj. Check exitPanel fn for:",obj);
	}
	parent.isActive = false; //Stops resizing (possibly used to stop data calls too??)
	removeChildren(parent);
}

function removeChildren(parent) {
	if ("panel" in parent) {
		for (let i=0; i<parent.panel.length; i++) {
			let aPanel = parent.panel[i];
			if (aPanel) {aPanel.dataActive = false;} //Stops data update loop
			if (aPanel) {aPanel.isActive = false;} //Stops resizing 
			removeChildren(aPanel); //Recursive call
			parent.div.removeChild(aPanel.div); //This only occurs after all recursive calls to function complete
		}
	}
}
