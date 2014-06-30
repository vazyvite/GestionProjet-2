var vm;
(function($){
	/**
	 * Objet vue modèle
	 */
	var VueModel = function(){
		var self = this;

		self.enums = {
			CODE_ACTION_DEVELOPPEMENT: 0,
			CODE_ACTION_CORRECTION: 1,
			CODE_ACTION_CHIFFRAGE: 2,
			CODE_ACTION_RECHIFFRAGE: 3,
			CODE_ACTION_CLOTURE: 4,
			CODE_ACTION_REOUVERTURE: 5,
			CODE_ACTION_COMMENTAIRE: 6,
			LIBELLE_TYPE_EVENT_CHIFFRAGE: "chiffrage",
			LIBELLE_TYPE_EVENT_RECHIFFRAGE: "rechiffrage",
			LIBELLE_TYPE_EVENT_DEVELOPPEMENT: "développement",
			LIBELLE_TYPE_EVENT_CORRECTION: "correction",
			LIBELLE_TYPE_EVENT_CLOTURE: "cloture",
			LIBELLE_TYPE_EVENT_REOUVERTURE: "réouverture",
			LIBELLE_TYPE_EVENT_COMMENTAIRE: "commentaire"
		};

		var Ressource = function Ressource(){
			var that = this;
			that.idRessource = ko.observable();
			that.nomRessource = ko.observable();
			that.prenomRessource = ko.observable();
		};

		var Historique = function Historique(){
			var that = this;
			that.dateHistorique = ko.observable();
			that.codeAction = ko.observable();
			that.chiffrage = ko.observable();
			that.contributeur = ko.observable(new Ressource());
		};

		var Event = function Event(){
			var that = this;
			that.contributeur = ko.observable(new Ressource());
			that.dateEvent = ko.observable();
			that.typeEvent = ko.observable();
			that.descriptionEvent = ko.observable();
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
			that.listeEvenements = ko.observableArray([]).extend({ arrayTransformer: function(){ return new Event(); }});
			that.indicateurClos = ko.observable();
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
		self.newEvent = function(){
			return new Event();
		};

		self.svgDataTaches = new Tache();

		self.gestionProjet = {
			listeTaches: ko.observableArray([]).extend({ arrayTransformer: function(){ return new Tache(); }}),
			listeRessources: ko.observableArray([]).extend({ arrayTransformer: function(){ return new Ressource(); }}),
			tacheSelectionnee: ko.observable(new Tache()),
			tachePointee: ko.observable(new Tache()),
			utilisateurCourant: ko.observable(new Ressource())
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