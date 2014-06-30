function Fonctions(){
	var self = this,
		core = new Core();

	self.getAppParameters = function(callback){
		core.loadParameters(callback);
	};

	self.initialisationBibliotheque = function(callback){
		core.appelServeur("initialiserBibliotheque", null, callback);
		vm.panelGestionProjet('0');
	};

	var itererTaches = function(listeTaches, mapTaches){
		if(listeTaches != null && listeTaches.length){
			var i = 0, tache = null;
			for(i; i < listeTaches.length; i++){
				tache = listeTaches[i];
				if(!mapTaches.hasOwnProperty(tache.idTache())){
					mapTaches[tache.idTache()] = tache;
				}
				if(tache.listeTaches().length){
					itererTaches(tache.listeTaches(), mapTaches);
				}
			}
		}
		return mapTaches;
	},
	getMaxChart = function(tache){
		if(tache != null){
			var valeurChiffrageInitial = parseFloat(tache.chiffrageInitial()),
			valeurChiffrageConsomme = parseFloat(tache.chiffrageConsomme()),
			valeurRAF = parseFloat(tache.chiffrageResteAFaire());
			return (valeurChiffrageInitial >= valeurChiffrageConsomme + valeurRAF) ? valeurChiffrageInitial : valeurChiffrageConsomme + valeurRAF;
		}
	},
	miseAJourDiagramme = function(tache){
		if(tache != null){
			var categories = [],
				serieDev = [],
				serieCorrection = [],
				dateDebut = null, dateFin = null,
				now = new Date(),
				nbCategories = 0, i = 0;
			if($.isNullOrEmpty(tache.dateDebutDev())){
				dateDebut = ($.isNullOrEmpty(tache.dateDebutCorrection())) ? now.addDays(-1) : tache.dateDebutCorrection();
			}else{
				if($.isNullOrEmpty(tache.dateDebutCorrection())){
					dateDebut = tache.dateDebutDev();
				}else{
					dateDebut = (tache.dateDebutDev() < tache.dateDebutCorrection()) ? tache.dateDebutDev() : tache.dateDebutCorrection();
				}
			}
			dateDebut = new Date(dateDebut);
			if($.isNullOrEmpty(tache.dateFinDev())){
				if($.isNullOrEmpty(tache.dateFinCorrection())){
					var consommation = parseFloat(tache.chiffrageConsomme()) + parseFloat(tache.chiffrageResteAFaire()) + parseFloat(tache.chiffrageCorrection());
					if(consommation < 2){
						consommation = now.addDays(2);
					}
					dateFin = new Date(dateDebut).addDays(consommation);
				}else{
					dateFin = new Date(tache.dateFinCorrection());
				}
			}else{
				if($.isNullOrEmpty(tache.dateFinCorrection())){
					dateFin = tache.dateFinDev();
				}else{
					dateFin = (tache.dateFinDev() > tache.dateFinCorrection()) ? tache.dateFinDev() : tache.dateFinCorrection();
				}
			}
			dateFin = new Date(dateFin);
			nbCategories = Math.floor(new Date(dateFin - dateDebut).getTime() / 86400000) + 1;
			var dateCategorie = new Date(dateDebut);
			for(i; i < nbCategories; i++){
					dateCategorieSerie = new Date(dateCategorie.getFullYear() + "-" + (dateCategorie.getMonth() + 1) + "-" + dateCategorie.getDate()),
					sommeDeveloppement = 0, sommeCorrection = null;
				categories.push(dateCategorie.getLitteralDate() + "/" + dateCategorie.getLitteralMonth());
				for(var h = 0; h < tache.historique().length; h++){
					var dateHistorique = new Date(tache.historique()[h].dateHistorique()),
						dateSerie = new Date(dateHistorique.getFullYear() + "-" + (dateHistorique.getMonth() + 1) + "-" + dateHistorique.getDate());
					if(tache.historique()[h].chiffrage() != null && dateCategorieSerie.getTime() == dateSerie.getTime()){
						if(tache.historique()[h].codeAction() == 0){
							sommeDeveloppement = (sommeDeveloppement == null) ? tache.historique()[h].chiffrage() : sommeDeveloppement + tache.historique()[h].chiffrage();
						}else if(tache.historique()[h].codeAction() == 1){
							sommeCorrection = (sommeCorrection == null) ? tache.historique()[h].chiffrage() : sommeCorrection + tache.historique()[h].chiffrage();
						}
					}else{
						if((!$.isNullOrEmpty(tache.dateFinDev()) && dateCategorieSerie.getTime() > new Date(tache.dateFinDev()).getTime()) || (!$.isNullOrEmpty(tache.dateDebutDev()) && dateCategorieSerie.getTime() < new Date(tache.dateDebutDev()).getTime())){
							sommeDeveloppement = null;
						}
					}
				}
				serieDev.push(sommeDeveloppement);
				serieCorrection.push(sommeCorrection);
				dateCategorie.addDays(1);
			}

			$('#chartdiv').css({"width" : $("#modalTache").width() * .85 }).highcharts({
				chart: { type: 'spline' },
				title: { text: null },
				xAxis: { categories: categories },
				yAxis: {
					title: { text: 'Jours'  },
					plotLines: [{ value: 0, width: 1, color: '#808080' }]
				},
				tooltip: { valueSuffix: 'jour(s)' },
				series: [{
					name: vm.enums.LIBELLE_TYPE_EVENT_DEVELOPPEMENT,
					data: serieDev
				},{
					name: vm.enums.LIBELLE_TYPE_EVENT_CORRECTION,
					data: serieCorrection
				}],
				credits: { enabled: false }
			});
		}
	},
	creerEvenement = function(historique){
		var evenement = vm.newEvent(),
			libelleJour = (parseFloat(historique.chiffrage()) < 2) ? " jour" : " jours",
			nom = historique.contributeur().nomRessource(),
			prenom = historique.contributeur().prenomRessource();
		ko.jsam.copy(historique.contributeur(), evenement.contributeur());
		evenement.dateEvent(ko.toJS(historique.dateHistorique()));
		if(nom != null){
			nom = nom.toUpperCase();
		}
		switch (historique.codeAction()){
			case vm.enums.CODE_ACTION_DEVELOPPEMENT:
				if(historique.chiffrage() != null){
					evenement.typeEvent(vm.enums.LIBELLE_TYPE_EVENT_DEVELOPPEMENT);
					evenement.descriptionEvent(prenom + " " + nom + " a passé " + historique.chiffrage() + libelleJour + " en " + evenement.typeEvent());
				}
				break;
			case vm.enums.CODE_ACTION_CORRECTION:
				if(historique.chiffrage() != null){
					evenement.typeEvent(vm.enums.LIBELLE_TYPE_EVENT_CORRECTION);
					evenement.descriptionEvent(prenom + " " + nom + " a passé " + historique.chiffrage() + libelleJour + " en " + evenement.typeEvent());
				}
				break;
			case vm.enums.CODE_ACTION_CHIFFRAGE:
				evenement.typeEvent(vm.enums.LIBELLE_TYPE_EVENT_CHIFFRAGE);
				evenement.descriptionEvent(prenom + " " + nom + " a chiffré la tâche.");
				break;
			case vm.enums.CODE_ACTION_RECHIFFRAGE:
				evenement.typeEvent(vm.enums.LIBELLE_TYPE_EVENT_RECHIFFRAGE);
				evenement.descriptionEvent(prenom + " " + nom + " a rechiffré la tâche.");
				break;
			case vm.enums.CODE_ACTION_CLOTURE:
				evenement.typeEvent(vm.enums.LIBELLE_TYPE_EVENT_CLOTURE);
				evenement.descriptionEvent(prenom + " " + nom + " a clôturé la tâche.");
				break;
			case vm.enums.CODE_ACTION_REOUVERTURE:
				evenement.typeEvent(vm.enums.LIBELLE_TYPE_EVENT_REOUVERTURE);
				evenement.descriptionEvent(prenom + " " + nom + " a réouvert la tâche.");
				break;
			case vm.enums.CODE_ACTION_COMMENTAIRE:
				evenement.typeEvent(vm.enums.LIBELLE_TYPE_EVENT_COMMENTAIRE);
				// TODO gestion du commentaire
				evenement.descriptionEvent(prenom + " " + nom + "  ");
				break;
			default:
				evenement.typeEvent(null);
				evenement.descriptionEvent(null);
				break;
		}
		return evenement;
	},
	miseAJourEvenements = function(tache, isReset, tacheHistorique){
		if(tache != null){
			if(isReset){
				var i = 0;
				tache.listeEvenements([]);
				for(i; i < tache.historique().length; i++) {
					tache.listeEvenements.push(creerEvenement(tache.historique()[i]));
				}
			} else if(tacheHistorique != null){
				historique = tacheHistorique;
				tache.listeEvenements.push(creerEvenement(tacheHistorique));
			}
		}
	};

	self.miseAJourDiagramme = function(tache){
		return miseAJourDiagramme(tache);
	};
	self.miseAJourEvenements = function(tache, isReset, tacheHistorique){
		return miseAJourEvenements(tache, isReset, tacheHistorique);
	};

	self.getMapTaches = function(){
		return itererTaches(vm.gestionProjet.listeTaches(), {});
	};

	self.changerContexteTache = function(tache, isAccesEnfants){
		if(tache != null){
			if(isAccesEnfants){
				// tache = objet Tache
				if(tache.listeTaches().length){
					vm.gestionProjet.tacheSelectionnee(tache);
				}
			}else{
				// tache = idTacheParent
				var mapTaches = self.getMapTaches();
				if(mapTaches.hasOwnProperty(tache)){
					vm.gestionProjet.tacheSelectionnee(mapTaches[tache]);
				}
			}
		}
	};

	self.miseAJourTacheParent = function(tacheCourante){
		var mapTaches = fn.getMapTaches();
		if(mapTaches.hasOwnProperty(tacheCourante.idTacheParent())){
			var tacheParent = mapTaches[tacheCourante.idTacheParent()],
				i = 0, sommeRAF = 0,
				sommeConsomme = 0, sommeEstime = 0,
				tacheEnfant = null;
			for(i; i < tacheParent.listeTaches().length; i++){
				tacheEnfant = tacheParent.listeTaches()[i];
				sommeEstime += parseFloat(tacheEnfant.chiffrageInitial());
				sommeConsomme += parseFloat(tacheEnfant.chiffrageConsomme());
				sommeRAF += parseFloat(tacheEnfant.chiffrageResteAFaire());
			}
			tacheParent.chiffrageInitial(sommeEstime);
			tacheParent.chiffrageConsomme(sommeConsomme);
			tacheParent.chiffrageResteAFaire(sommeRAF);
		}
	};

	/**
	 * Initialise et affiche la modale des taches dans le cas d'une visualisation/modification
	 * @param  {Object} dataTache [les valeurs de la tâche à traiter]
	 * - isole la tache dans tachePointee
	 * - sauvegarde de la tache
	 * - construction du diagramme d'activité
	 * - construction de la liste des évènements
	 */
	self.afficherModalTache = function(dataTache){
		vm.gestionProjet.tachePointee(vm.newTache());
		ko.jsam.copy(dataTache, vm.gestionProjet.tachePointee());
		var tachePointee = vm.gestionProjet.tachePointee();
		// if(!$.isNullOrEmpty(tachePointee.chiffrageResteAFaire())){
			ko.jsam.copy(tachePointee, vm.svgDataTaches);
			miseAJourDiagramme(tachePointee);
			miseAJourEvenements(tachePointee, true, null);
		// }
		$("#modalTache").modal("show");
	};

	/**
	 * initialise et affiche la modale des taches dans le cas d'une création
	 * - initialisation d'une nouvelle tache
	 * - affichage de la modale des taches
	 * - mise à jour de la tache parent
	 */
	self.creerNouvelleTache = function(){
		vm.actionCreationTache(true);
		var nouvelleTache = vm.newTache(),
			idTache = new Date().getTime(),
			dataNouvelleTache = null;
		nouvelleTache.idTache(idTache);
		nouvelleTache.idTacheParent(vm.gestionProjet.tacheSelectionnee().idTache());
		vm.gestionProjet.tacheSelectionnee().listeTaches.push(nouvelleTache);
		dataNouvelleTache = ko.dataFor($(".tache[data-tache=" + nouvelleTache.idTache() + "]")[0]);
		self.afficherModalTache(dataNouvelleTache);
		self.miseAJourTacheParent(dataNouvelleTache);
	};

	/**
	 * initialise et affiche la modale des taches dans le cas d'une création de tache enfant
	 * @param  {[jQueryObject]} tache [la tache parent]
	 */
	self.creerNouvelleTacheFille = function(tache){
		vm.actionCreationTache(true);
		var nouvelleTache = vm.newTache(),
			idTache = new Date().getTime(),
			tacheParent = ko.dataFor(tache),
			dataNouvelleTache = null;
		nouvelleTache.idTache(idTache);
		nouvelleTache.idTacheParent(tacheParent.idTache());
		tacheParent.listeTaches.push(nouvelleTache);
		self.changerContexteTache(tacheParent, true);
		dataNouvelleTache = ko.dataFor($(".tache[data-tache=" + nouvelleTache.idTache() + "]")[0]);
		self.afficherModalTache(dataNouvelleTache);
		self.miseAJourTacheParent(dataNouvelleTache);
	};

	self.supprimerTache = function(tache){
		if(tache != null){
			var mapTaches = self.getMapTaches();
			if(mapTaches.hasOwnProperty(tache.idTacheParent())){
				var tacheParent = mapTaches[tache.idTacheParent()];
				if(tacheParent != null && tacheParent.listeTaches().length){
					tacheParent.listeTaches.remove(tache);
				}
			}
		}
		self.miseAJourTacheParent(tache);
	};

	self.reinitialiserTache = function(tacheSource, tacheCible){
		tacheCible.nomTache(ko.toJS(tacheSource.nomTache()));
		tacheCible.chiffrageInitial(ko.toJS(tacheSource.chiffrageInitial()))
		tacheCible.chiffrageConsomme(ko.toJS(tacheSource.chiffrageConsomme()));
		tacheCible.chiffrageResteAFaire(ko.toJS(tacheSource.chiffrageResteAFaire()));
		tacheCible.chiffrageCorrection(ko.toJS(tacheSource.chiffrageCorrection()));
		tacheCible.ressource(ko.toJS(tacheSource.ressource()));
		tacheCible.descriptionTache(ko.toJS(tacheSource.descriptionTache()));
		tacheCible.dateDebutDev(ko.toJS(tacheSource.dateDebutDev()));
		tacheCible.dateFinDev(ko.toJS(tacheSource.dateFinDev()));
		tacheCible.dateDebutCorrection(ko.toJS(tacheSource.dateDebutCorrection()));
		tacheCible.dateFinCorrection(ko.toJS(tacheSource.dateFinCorrection()));
	};

	self.createHistorique = function(now, codeAction, chiffrage){
		var historique = vm.newHistorique();
		historique.dateHistorique(now);
		historique.codeAction(codeAction);
		historique.chiffrage(chiffrage);
		ko.jsam.copy(vm.gestionProjet.utilisateurCourant(), historique.contributeur());
		return historique;
	};

	self.publishHistorique = function(tache, tacheSauvegardee){
		if(tache != null && tacheSauvegardee != null){
			/*
			x chiffrage (modification du chiffrage initial avec valeur initiale à 0)
			x rechiffrage (modification du chiffrage initial avec valeur initiale différente de 0)
			x développement (modification du chiffrage consommé)
			x correction (modification du chiffrage correction)
			x fermeture (lorsque le RAF tombe à 0)
			x réouverture (lorsque le RAF passe de 0 à plus)
			. commentaire (ajout manuel d'un commentaire)*/
			var now = new Date().getTime();
			if(tacheSauvegardee.chiffrageInitial() != tache.chiffrageInitial()){
				if(tacheSauvegardee.chiffrageInitial() == 0){
					tache.historique.push(fn.createHistorique(now, vm.enums.CODE_ACTION_CHIFFRAGE, null));
				}else if(tacheSauvegardee.chiffrageInitial() > 0){
					tache.historique.push(fn.createHistorique(now, vm.enums.CODE_ACTION_RECHIFFRAGE, null));
				}
			}
			if(tacheSauvegardee.chiffrageConsomme() != tache.chiffrageConsomme()){
				tache.historique.push(fn.createHistorique(now, vm.enums.CODE_ACTION_DEVELOPPEMENT, parseFloat(tache.chiffrageConsomme()) - parseFloat(tacheSauvegardee.chiffrageConsomme())));
			}
			if(tacheSauvegardee.chiffrageCorrection() != tache.chiffrageCorrection()){
				tache.historique.push(fn.createHistorique(now, vm.enums.CODE_ACTION_CORRECTION, parseFloat(tache.chiffrageCorrection()) - parseFloat(tacheSauvegardee.chiffrageCorrection())));
			}
			if(tacheSauvegardee.chiffrageResteAFaire() != tache.chiffrageResteAFaire() && (parseFloat(tacheSauvegardee.chiffrageResteAFaire()) - parseFloat(tache.chiffrageResteAFaire()) == parseFloat(tache.chiffrageConsomme()) - parseFloat(tacheSauvegardee.chiffrageConsomme()))) {
				if(tache.chiffrageResteAFaire() == 0){
					tache.historique.push(fn.createHistorique(now, vm.enums.CODE_ACTION_CLOTURE, null));
				}else if(tacheSauvegardee.chiffrageResteAFaire() == 0){
					tache.historique.push(fn.createHistorique(now, vm.enums.LIBELLE_TYPE_EVENT_REOUVERTURE, null));
				}
			}
		}
	};

	self.ui = {
		disableEstimationInitiale: function(tache){
			if(vm.actionCreationTache() == true){
				return false;
			}
			if(tache != null && (tache.listeTaches().length || (tache.chiffrageInitial() != null && parseFloat(tache.chiffrageInitial()) != 0))){
				return true;
			}
			return false;
		},
		disableChargeConsommee: function(tache){
			if(tache != null){
				if(tache.listeTaches().length){
					return true;
				}else if(tache.chiffrageInitial() == null){
					return true;
				}
			}
			return false;
		},
		disableChargeCorrection: function(tache){
			if(tache != null){
				if(tache.listeTaches().length){
					return true;
				}else if(tache.chiffrageInitial() == null){
					return true;
				}
			}
			return false;
		},
		disableRAF: function(tache){
			if(tache != null){
				if(tache.listeTaches().length){
					return true;
				}else if(tache.chiffrageInitial() == null){
					return true;
				}
			}
			return false;
		},
		appName: function(application){
			if(application != null && application.appName() != null && application.appVersion() != null){
				return application.appName() + ' v' + application.appVersion();
			}
			return "";
		},
		conditionClassToDoTask: function(tache){
			if(tache != null && parseFloat(tache.chiffrageConsomme()) === 0){
				return true;
			}
			return false;
		},
		conditionClassRunningTask: function(tache){
			if(tache != null && parseFloat(tache.chiffrageResteAFaire()) > 0 && parseFloat(tache.chiffrageConsomme()) > 0){
				return true;
			}
			return false;
		},
		conditionClassFinishedTask: function(tache){
			if(tache != null && parseFloat(tache.chiffrageResteAFaire()) === 0){
				return true;
			}
			return false;
		},
		calculerEstimationChartWidth: function(tache){
			if(tache != null){
				var max = getMaxChart(tache);
				if(max != null){
					return Math.floor(parseFloat(tache.chiffrageInitial()) * 100 / max) + "%";
				}
			}
			return null;
		},
		calculerConsommeChartWidth: function(tache){
			if(tache != null){
				var max = getMaxChart(tache);
				if(max != null){
					return Math.floor(parseFloat(tache.chiffrageConsomme()) * 100 / max) + "%";
				}
			}
			return null;
		},
		calculerRAFChartWidth: function(tache){
			if(tache != null){
				var max = getMaxChart(tache);
				if(max != null){
					return Math.floor(parseFloat(tache.chiffrageResteAFaire()) * 100 / max) + "%";
				}
			}
			return null;
		},
		calculerAvancementTache: function(tache){
			if(tache != null){
				var consomme = parseFloat(tache.chiffrageConsomme()),
					raf = parseFloat(tache.chiffrageResteAFaire()),
					total = 0;
				if(isNaN(consomme)){
					consomme = 0;
				}
				if(isNaN(raf)){
					raf = 0;
				}
				total = consomme + raf;
				if(total != 0){
					return Math.floor((consomme * 100) / total);
				}
			}
			return 0;
		},
		calculerAvancementTacheParent: function(tache){
			if(tache != null && tache.listeTaches().length){
				var total = 0, i = 0,
					totalConsomme = 0,
					totalRAF = 0;
				for(i; i < tache.listeTaches().length; i++){
					if(tache.listeTaches()[i].chiffrageConsomme() != null){
						totalConsomme += parseFloat(tache.listeTaches()[i].chiffrageConsomme());
					}
					if(tache.listeTaches()[i].chiffrageResteAFaire() != null){
						totalRAF += parseFloat(tache.listeTaches()[i].chiffrageResteAFaire());
					}
				}
				total = totalConsomme + totalRAF;
				if(total != 0){
					return Math.floor((totalConsomme * 100) / total);
				}
			}
			return 0;
		},
		textRecapChiffrage: function(tache){
			if(tache != null){
				var texte = ($.isNullOrEmpty(tache.dateFinDev())) ? "~" : "";
				return texte + (parseFloat(tache.chiffrageConsomme()) + parseFloat(tache.chiffrageResteAFaire()) + parseFloat(tache.chiffrageCorrection()) ) + 'j /' + tache.chiffrageInitial();
			}
			return "";
		},
		dateText: function(date){
			if(date != null){
				var dateDate = new Date(date);
				if(dateDate.isValid()){
					return dateDate.toTextualDate();
				}
			}
			return null;
		}
	};

	self.validation = {
		test : {
			required: function(tache, nomChamp, messageErreur){
				if (tache != null && nomChamp != null && tache.hasOwnProperty(nomChamp) && $.isNullOrEmpty(tache[nomChamp]())) {
					if(messageErreur != null){
						return messageErreur;
					}else{
						return "Le champ " + nomChamp + " doit être renseigné";
					}
				}
				return null;
			},
			isNumeric: function(tache, nomChamp, messageErreur){
				if (tache != null && nomChamp != null && tache.hasOwnProperty(nomChamp) && isNaN(tache[nomChamp]())) {
					if(messageErreur != null){
						return messageErreur;
					}else{
						return "Le champ " + nomChamp + " doit être un nombre.";
					}
				}
			}
		},
		creationTache: function(tache){
			if(tache != null){
				var listeErreur = [];
				listeErreur.pushNotNull(self.validation.test.required(tache, "nomTache", null));
				listeErreur.pushNotNull(self.validation.test.required(tache, "chiffrageInitial", null));
				listeErreur.pushNotNull(self.validation.test.isNumeric(tache, "chiffrageInitial", null));
				listeErreur.pushNotNull(self.validation.test.required(tache, "chiffrageConsomme", null));
				listeErreur.pushNotNull(self.validation.test.isNumeric(tache, "chiffrageConsomme", null));
				listeErreur.pushNotNull(self.validation.test.required(tache, "chiffrageResteAFaire", null));
				listeErreur.pushNotNull(self.validation.test.isNumeric(tache, "chiffrageResteAFaire", null));
				listeErreur.pushNotNull(self.validation.test.required(tache, "descriptionTache", null));
				if(listeErreur.length){
					alert(listeErreur.join("\n"));
					return false;
				}
				return true;
			}
			return false;
		}
	};
}