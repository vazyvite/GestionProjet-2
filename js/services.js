function Services(){
	var self = this;

	self.initialiserBibliotheque = function(serveur, service, callback){
		var parametres = {};
		serveur.appelServeur(service, parametres, callback);
	};
};