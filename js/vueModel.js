var vm;
(function($){
	/**
	 * Objet vue modèle
	 */
	var VueModel = function(){
		var self = this;

		var Ressource = function Ressource(){
			var that = this;
			that.idRessource = ko.observable();
			that.nomRessource = ko.observable();
			that.prenomRessource = ko.observable();
		};

		var Tache = function Tache(){
			var that = this;
			that.idTache = ko.observable();
			that.nomTache = ko.observable();
			that.chiffrageInitial = ko.observable();
			that.chiffrageConsomme = ko.observable();
			that.chiffrageResteAFaire = ko.observable();
			that.chiffrageCorrection = ko.observable();
			that.ressource = ko.observable(new Ressource());
			that.idTacheParent = ko.observable();
			that.descriptionTache = ko.observable();
			that.listeTaches = ko.observableArray([]).extend({ arrayTransformer: function(){ return new Tache(); }});
			that.chiffrageConsomme.subscribe(function(valeur){
				if(that.idTacheParent() != null){
					var raf = parseFloat(that.chiffrageResteAFaire());
					if(parseFloat(valeur) > parseFloat(vm.svgDataTaches.chiffrageConsomme())) {
						raf = raf - (parseFloat(valeur) - parseFloat(vm.svgDataTaches.chiffrageConsomme()));
					}else if(parseFloat(valeur) < parseFloat(vm.svgDataTaches.chiffrageConsomme())) {
						raf = raf + (parseFloat(vm.svgDataTaches.chiffrageConsomme()) - parseFloat(valeur));
					}
					if(raf < 0){
						raf = 0;
					}
					that.chiffrageResteAFaire(raf);
					vm.svgDataTaches.chiffrageConsomme(valeur);
					vm.svgDataTaches.chiffrageResteAFaire(raf);
					fn.miseAJourTacheParent(that);
				}
			});
			that.chiffrageResteAFaire.subscribe(function(valeur){
				if(that.idTacheParent() != null){
					fn.miseAJourTacheParent(that);
				}
			});
		};

		self.newRessource = function(){
			return new Ressource();
		};
		self.newTache = function(){
			return new Tache();
		};

		self.svgDataTaches = {
			chiffrageInitial: ko.observable(),
			chiffrageConsomme: ko.observable(),
			chiffrageResteAFaire: ko.observable()
		};

		/*var Projet = function(){
			var that = this;
			that.idProjet = ko.observable();
			that.nomProjet = ko.observable();
			that.listeTaches = ko.observableArray([]).extend({ arrayTransformer: function(){ return new Tache(); }});
			that.tacheSelectionnee = ko.observable(new Tache());
		};*/

		self.gestionProjet = {
			listeTaches: ko.observableArray([]).extend({ arrayTransformer: function(){ return new Tache(); }}),
			listeRessources: ko.observableArray([]).extend({ arrayTransformer: function(){ return new Ressource(); }}),
			tacheSelectionnee: ko.observable(new Tache()),
			tachePointee: ko.observable(new Tache())
		};

		self.app = {
			appName: ko.observable(),
			appVersion: ko.observable()
		};

		self.panelGestionProjet = ko.observable("0");

		self.actionCreationTache = ko.observable(false);

		/**
		 * Objet urlParameters
		 * permet de gérer les paramètres issus de l'URL
		 */
		var urlParameters = function(){
			var that = this;
		};
		self.urlParameters = ko.observable(new urlParameters());
	};

	$(function(){
		vm = new VueModel();
		ko.applyBindings(vm);
	});
}(jQuery));