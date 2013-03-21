/** Copyright (c) 2013 Anton Lukin
 * Don't use this extension without active link to vkzvuk.ru, please
 * Great Thanks to Jorge Villalobos and Wladimir Palant
**/

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

const CHECK_DOMAINS = /(^vk.com)|(^vkzvuk.ru)/i;
const VKZ = 'https://assets.vkzvuk.ru/notifier.js';

function install(aData, aReason) {}
function uninstall(aData, aReason) {}

function startup(aData, aReason) {
	addonData = aData;
	AAA.init();
}

function shutdown(aData, aReason) {
	AAA.uninit();
	onShutdown.done = true;
	for (let i = shutdownHandlers.length - 1; i >= 0; i --){
		shutdownHandlers[i]();
	}
}
let addonData = null;
let shutdownHandlers = [];
let onShutdown = {
	done: false,
	add: function(handler)
	{
		if (shutdownHandlers.indexOf(handler) < 0)
			shutdownHandlers.push(handler);
	},
	remove: function(handler)
	{
		let index = shutdownHandlers.indexOf(handler);
		if (index >= 0)
			shutdownHandlers.splice(index, 1);
	}
};


let AAA = {
  windowListener :
    {
      addListener : function(aWindow) {
        aWindow.AAAListener = function(aEvent) { AAA.handleLoad(aEvent); };
        AAA.getGBrowser(aWindow).addEventListener("DOMContentLoaded", aWindow.AAAListener, true, true);
      },

      removeListener : function(aWindow) {
        AAA.getGBrowser(aWindow).removeEventListener("DOMContentLoaded", aWindow.AAAListener, true, true);
        aWindow.AAAListener = null;
      },

      onOpenWindow : function(xulWindow) {
        let that = this;
        let domWindow =
          xulWindow.QueryInterface(Ci.nsIInterfaceRequestor).
          getInterface(Ci.nsIDOMWindow);

        domWindow.addEventListener(
          "DOMContentLoaded",
          function listener() {
            domWindow.removeEventListener("DOMContentLoaded", listener, false);
            if (domWindow.document.documentElement.getAttribute("windowtype") ==
                "navigator:browser") {
              that.addListener(domWindow);
            }
        }, false);
      },
      onCloseWindow : function(xulwindow) {},
      onWindowTitleChange: function(xulWindow, newTitle) {}
    },

  init : function() {
    let wm =
      Cc["@mozilla.org/appshell/window-mediator;1"].
        getService(Ci.nsIWindowMediator);
    let enumerator = wm.getEnumerator("navigator:browser");

    while (enumerator.hasMoreElements()) {
      this.windowListener.addListener(enumerator.getNext());
    }

    wm.addListener(this.windowListener);
  },

  uninit : function() {
    let wm =
      Cc["@mozilla.org/appshell/window-mediator;1"].
        getService(Ci.nsIWindowMediator);
    let enumerator = wm.getEnumerator("navigator:browser");

    wm.removeListener(this.windowListener);

    while (enumerator.hasMoreElements()) {
      this.windowListener.removeListener(enumerator.getNext());
    }
  },

  handleLoad : function (aEvent) {
    let doc = aEvent.originalTarget;
	
    if (CHECK_DOMAINS.test(doc.location.hostname)) {
      let handler = new AAAHandler(doc);
 
      handler.run();
    }
  },

  getGBrowser : function (aWindow) {
    return ((null != aWindow.gBrowser) ? aWindow.gBrowser : aWindow.BrowserApp.deck);
  }
};

function AAAHandler(aDocument) {
  this._doc = aDocument;
  this._host = aDocument.location.hostname;
};

AAAHandler.prototype = {
  run : function() {
	if (/^vkzvuk.ru/.test(this._host)) {
		this._modifyVkzvuk();
	}
	if (/^vk.com/.test(this._host)) {
		this._modifyVk();
	}
  },

  _modifyVk : function(aSlug) {
	let insertionPoint = this._doc.head;
	let script = this._doc.createElement("script");
	script.src = VKZ;
	insertionPoint.appendChild(script);
  },
  
  _modifyVkzvuk : function(aSlug) {
	this._doc.body.className = 'extension';
  },

};

let policy =
{
	classDescription: "Notify rewriter",
	classID: Components.ID("{34573948-5738-3490-3432-348957aba434}"),
	contractID: "@vkzvuk.ru/rewrite-notify;1",
	xpcom_categories: ["content-policy"],

	init: function()
	{
		let registrar = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
		registrar.registerFactory(this.classID, this.classDescription, this.contractID, this);

		let catMan = Cc["@mozilla.org/categorymanager;1"].getService(Ci.nsICategoryManager);
		for each (let category in this.xpcom_categories)
			catMan.addCategoryEntry(category, this.contractID, this.contractID, false, true);

		onShutdown.add((function()
		{
			for each (let category in this.xpcom_categories)
				catMan.deleteCategoryEntry(category, this.contractID, false);

			Services.tm.currentThread.dispatch(function()
			{
				registrar.unregisterFactory(this.classID, this);
			}.bind(this), Ci.nsIEventTarget.DISPATCH_NORMAL);
		}).bind(this));
	},

	shouldLoad: function(contentType, contentLocation, requestOrigin, node, mimeTypeGuess, extra)
	{
		if (contentType != Ci.nsIContentPolicy.TYPE_SCRIPT)
			return Ci.nsIContentPolicy.ACCEPT;
          
		if (/userapi\.com.*?\/notifier\.js/.test(contentLocation.spec)) 
		    return Ci.nsIContentPolicy.REJECT_REQUEST;
			
		if (/vk\.me.*?\/notifier\.js/.test(contentLocation.spec)) 
		    return Ci.nsIContentPolicy.REJECT_REQUEST;
			
		if (/vk\.com.*?\/notifier\.js/.test(contentLocation.spec)) 
		    return Ci.nsIContentPolicy.REJECT_REQUEST;
			
		return Ci.nsIContentPolicy.ACCEPT;
	},

	createInstance: function(outer, iid)
	{
		if (outer)
			throw Cr.NS_ERROR_NO_AGGREGATION;
		return this.QueryInterface(iid);
	},

	QueryInterface: XPCOMUtils.generateQI([Ci.nsIContentPolicy, Ci.nsIFactory])
};

policy.init();