function Core(){
	var core = this
		coreEnums = new CoreEnums(),
		loadingQueue = [],
		server = null;

	isQueueLoadingIsEmpty = function(){
		loadingQueue.shift();
		if(!loadingQueue.length){
			$(document).trigger("emptyLoadingQueue");
		}
	},

	loadJsScript = function(pathScriptJs){
		var methode = "loadJsScript";
		if(pathScriptJs != null){
			$.getScript(pathScriptJs, function(){
				console.log("chargement du script " + pathScriptJs);
				isQueueLoadingIsEmpty();
			}).fail(function(){
				console.log(core.gestionErrorMessages("2", methode, core.constructor.name));
			});
		}
	},

	attachLoadingQueueEvent = function(callback){
		$(document).bind("emptyLoadingQueue", function(){
			detachLoadingQueueEvent();
			server = new CoreServer();
			if($.isFunction(callback)){
				callback();
			}
		});
	},

	detachLoadingQueueEvent = function(){
		$(document).unbind("emptyLoadingQueue");
	},

	loadAllScripts = function(listPathJsScripts, callback){
		if(listPathJsScripts != null && listPathJsScripts.length){
			loadingQueue = listPathJsScripts;
			attachLoadingQueueEvent(callback);
			for(var i = 0; i < listPathJsScripts.length; i++){
				loadJsScript(listPathJsScripts[i]);
			}
		}
	},

	initializeApplication = function(dataJSON, callback){
		if(dataJSON != null && $.isPlainObject(dataJSON) && !$.isEmptyObject(dataJSON)){
			if(dataJSON.hasOwnProperty("scripts") && dataJSON.scripts.hasOwnProperty("js") && dataJSON.scripts.js.length){
				window["app"] = { "parameters": dataJSON };
				$("title").text(window.app.parameters.appName + " v" + window.app.parameters.appVersion);
				loadAllScripts(dataJSON.scripts.js, callback);
			}
		}
	};

	/**
	 * gère les messages d'erreur
	 * @param  {[String]} messageTypeError [code du message d'erreur : '0': Success, '1': Warning, '2': Error]
	 * @param  {[type]} methodInError    [description]
	 * @return {[type]}                  [description]
	 */
	core.gestionErrorMessages = function(messageTypeError, methodInError, objectInError){
		try {
			return coreEnums.getLibelleTypeMessageErrorByCode(messageTypeError) + " - " + objectInError + " - " + methodInError;
		} catch (e) { console.log(e); }
	}

	core.loadParameters = function(callback){
		var methode = "loadingParameters";
		$.getJSON(coreEnums.getPathParameterFile(),function(data){
       		console.log(core.gestionErrorMessages("0", methode, core.constructor.name));
			initializeApplication(data, callback);
	    }).error(function(){
	    	console.log(core.gestionErrorMessages("2", methode, core.constructor.name));
	    });
	};

	core.appelServeur = function(serviceName, parameters, callback){
		server.appelServeur(serviceName, parameters, callback);
	};
};