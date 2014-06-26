var vm;
(function($){
	/**
	 * Objet vue modèle
	 */
	var VueModel = function(){
		var self = this;

		/**
		 * codeAction : 0: développement, 1: corrections
		 *
		 */
		var Historique = function Historique(){
			var that = this;
			that.dateHistorique = ko.observable();
			that.codeAction = ko.observable();
			that.chiffrage = ko.observable();
		};

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
			that.historique = ko.observableArray([]).extend({ arrayTransformer: function(){ return new Historique(); }});
			that.dateDebutDev = ko.observable();
			that.dateFinDev = ko.observable();
			that.dateDebutCorrection = ko.observable();
			that.dateFinCorrection = ko.observable();
			that.chiffrageConsomme.subscribe(function(valeur){
				if(that.idTacheParent() != null){
					var raf = parseFloat(that.chiffrageResteAFaire()),
						historique = self.newHistorique(),
						now = new Date();
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
					// création d'une entrée dans l'historique
					historique.dateHistorique(now);
					historique.codeAction(0);
					historique.chiffrage(parseFloat(valeur) - parseFloat(vm.svgDataTaches.chiffrageConsomme()));
					that.historique.push(historique);
					// ajout de la date de début des dévs
					if(that.dateDebutDev() == null){
						that.dateDebutDev(now);
					}
					// ajout de la date de fin de dév
					if(parseFloat(that.chiffrageResteAFaire()) == 0){
						that.dateFinDev(now);
					}
					fn.miseAJourTacheParent(that);
				}
			});
			that.chiffrageResteAFaire.subscribe(function(valeur){
				if(that.idTacheParent() != null){
					fn.miseAJourTacheParent(that);
				}
			});
			that.chiffrageCorrection.subscribe(function(valeur){
				var historique = self.newHistorique(),
					now = new Date();
				// création d'une entrée dans l'historique
				historique.dateHistorique(now);
				historique.codeAction(1);
				historique.chiffrage(parseFloat(valeur) - parseFloat(vm.svgDataTaches.chiffrageCorrection()));
				// ajout de la date de début des corrections
				if(that.dateDebutCorrection() == null){
					that.dateDebutCorrection(now);
				}
				// ajout de la date de fin des corrections
				that.dateFinCorrection(now);
			});
		};

		self.newRessource = function(){
			return new Ressource();
		};
		self.newTache = function(){
			return new Tache();
		};
		self.newHistorique = function(){
			return new Historique();
		};

		self.svgDataTaches = {
			chiffrageInitial: ko.observable(),
			chiffrageConsomme: ko.observable(),
			chiffrageResteAFaire: ko.observable(),
			chiffrageCorrection: ko.observable()
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