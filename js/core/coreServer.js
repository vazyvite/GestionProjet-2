function CoreServer(){
	var that = this,
		urlRoot = window.app.parameters.urlRootServices,
		urlService = window.app.parameters.urlServices;

	/**
	 * Retourne l'url associée à un service
	 * @param  String serviceName 	le nom du service
	 * @return String 				l'url du service
	 */
	var getUrlByServiceName = function(serviceName){
		if(serviceName != null){
			if(urlService.hasOwnProperty(serviceName)){
				return urlRoot + urlService[serviceName];
			}
		}
		return false;
	};

	/**
	 * Appelle le serveur
	 * @param  String serviceName 	le nom du service
	 * @param  Object parametres 	les paramètres d'appel au service
	 * @param  Function callback	la fonction exécutée en succès d'appel
	 */
	that.appelServeur = function(serviceName, parametres, callback){
		if(serviceName != null){
			var url = getUrlByServiceName(serviceName);
			if(url){
				$.getJSON(url, function(data){
					if(data != null){
						if($.isFunction(callback)){
							callback(data);
						}
					}
				});
			}
		}
	};

	/**
	 * Gère la distribution des appels sur les différents services
	 * @param  String   serviceName le nom du service
	 * @param  Function callback    la fonction exécutée en succès d'appel
	 */
	that.swithService = function(serviceName, callback){
		if(that.services.hasOwnProperty(serviceName)){
			console.log("serveur > " + serviceName);
			var services = new Service();
			try {
				services[serviceName](that, serviceName, callback);
			} catch (e) {
				console.log(e);
			}
		}
	}

	/**
	 * Appel du service initialiserCV
	 * @param  String service 		le nom du service appelé
	 * @param  Function callback 	la fonction exécutée en succès d'appel
	 */
	/*that.services = {
		initialiserCV: function(service, callback){
			var parametres = {};
			appelServeur(service, parametres, callback);
		}
	}*/
};