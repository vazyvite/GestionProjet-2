var fn = new Fonctions();

$(function(){
	fn.getAppParameters(function(){
		vm.app.appName(window.app.parameters.appName);
		vm.app.appVersion(window.app.parameters.appVersion);
		fn.initialisationBibliotheque(function(data){
			vm.actionCreationTache(true);
			ko.jsam.copy(data, vm);
			if(vm.gestionProjet.listeTaches().length){
				vm.gestionProjet.tacheSelectionnee(vm.gestionProjet.listeTaches()[0]);
			}
			vm.actionCreationTache(false);
		});
	});

	$("#screenCache").coreScreen();

	$("body").on("click", ".navBtn", function(e){
		e.preventPropagation();
		$("#screenCache").data('coreScreen').goToScreen($(this).attr("data-navigationTo"));
	});

	// clic sur les taches de la liste des taches
	$("body").on("click", ".titreTache", function(e){
		fn.afficherModalTache(ko.dataFor($(this)[0]));
	});

	// double clic sur les taches de la liste des taches
	$("body").on("click", ".accessChildrenTaches", function(){
		fn.changerContexteTache(ko.dataFor($(this)[0]), true);
	});

	// clic de validation de la modale d'informations des taches
	$("body").on("click", "#modalTacheValidation", function(){
		if(fn.validation.scenario.creationTache(vm.gestionProjet.tachePointee())){
			var mapTaches = fn.getMapTaches();
			if(mapTaches != null){
				var tacheSource = mapTaches[vm.gestionProjet.tachePointee().idTache()];
				if(tacheSource != null){
					fn.publishHistorique(vm.gestionProjet.tachePointee(), vm.svgDataTaches);
					ko.jsam.copy(vm.gestionProjet.tachePointee(), tacheSource);
					ko.jsam.copy(vm.newTache(), vm.gestionProjet.tachePointee());
					ko.jsam.copy(vm.newTache(), vm.svgDataTaches);
					vm.actionCreationTache(false);
				}
			}
			$("#modalTache").modal("hide");
		}
	});

	$("body").on("click", "#modalTacheAnnulation", function(){
		// var mapTache = fn.getMapTaches();
		// if(mapTache != null){
			if(!vm.actionCreationTache() == false){
				// var tache = mapTache[vm.gestionProjet.tachePointee().idTache()];
				// if(tache){
				// 	fn.reinitialiserTache(vm.svgDataTaches, tache);
				// }
				// vm.gestionProjet.tachePointee(vm.svgDataTaches);
			// }else{
				// TODO cas de la suppression de tâche
				// fn.supprimerTache(data);
				vm.actionCreationTache(false);
			}
			ko.jsam.copy(vm.newTache(), vm.gestionProjet.tachePointee());
			ko.jsam.copy(vm.newTache(), vm.svgDataTaches);
			$("#modalTache").modal("hide");
		// }
	});

	// clic sur le bouton de retour vers la tache parent
	$("body").on("click", "#btnRetourContext", function(){
		fn.changerContexteTache(vm.gestionProjet.tacheSelectionnee().idTacheParent(), false);
	});

	$("body").on("click", ".createTask", function(){
		fn.creerNouvelleTache();
	});

	$("body").on("click", ".createChild", function(){
		fn.creerNouvelleTacheFille($(this)[0]);
	});

	$("body").on("click", ".deleteTache", function(){
		var data = ko.dataFor($(this)[0]),
			message = (data.listeTaches().length) ? "Vous allez supprimer la tache sélectionnée ainsi que toutes ses sous-tâches" : "Vous allez supprimer la tache sélectionnée";
		if(confirm(message)){
			fn.supprimerTache(data);
		}
	});

	/**
	 * Cas de modification de la valeur de la charge consommée
	 * si on est dans un cas de modification :
	 * - on recalcule le RAF
	 * - on défini la valeur de la dateDebutDev si elle n'est pas déjà définie
	 * - on défini la dateFinDev si le RAF est à 0
	 * - on met à jour le diagramme
	 * Dans tous les cas :
	 * - on met à jour la tâche parent
	 */
	$("body").on("change", "#chargeConsommeeTache", function(){
		var valeur = $(this).val(),
			tache = ko.dataFor(this);
		if(tache.idTacheParent() != null){
			if(vm.actionCreationTache() == false){
				var raf = (!isNaN(parseFloat(tache.chiffrageResteAFaire()))) ? parseFloat(tache.chiffrageResteAFaire()) : 0,
					now = new Date().getTime();
				if(parseFloat(valeur) > parseFloat(vm.svgDataTaches.chiffrageConsomme())) {
					raf = raf - (parseFloat(valeur) - parseFloat(vm.svgDataTaches.chiffrageConsomme()));
				}else if(parseFloat(valeur) < parseFloat(vm.svgDataTaches.chiffrageConsomme())) {
					raf = raf + (parseFloat(vm.svgDataTaches.chiffrageConsomme()) - parseFloat(valeur));
				}
				if(raf < 0){
					raf = 0;
				}
				tache.chiffrageResteAFaire(raf);
				// ajout de la date de début des dévs
				if($.isNullOrEmpty(tache.dateDebutDev()) || now < tache.dateDebutDev()){
					tache.dateDebutDev(now);
				}
				// ajout de la date de fin de dév
				if(!$.isNullOrEmpty(tache.dateFinDev()) && tache.dateFinDev() < now){
					tache.dateFinDev(now);
				}
				if(parseFloat(tache.chiffrageResteAFaire()) == 0){
					tache.dateFinDev(now);
				}
				// fn.miseAJourDiagramme(tache);
			}
			fn.miseAJourTacheParent(tache);
		}
	});

	/**
	 * Modification de la valeur du chiffrage du RAF
	 * Si une tache parent est définie :
	 * - mise à jour de la tâche parent
	 * Si la valeur est différente de 0 et que l'on est en cours de modification :
	 * la dateFinDev est réinitialisée
	 */
	$("body").on("change", "#rafTache", function(){
		var valeur = $(this).val(),
			tache = ko.dataFor(this);
		if(tache.idTacheParent() != null){
			fn.miseAJourTacheParent(tache);
		}
		if(vm.actionCreationTache() == false && valeur != 0){
			tache.dateFinDev(null);
		}
	});

	/**
	 * Modification de la valeur de la charge des corrections
	 * Si on est en cours de modification :
	 * - initialisation de la date de début si elle n'est pas renseignée
	 * - mise à jour de la date de fin de correction
	 * - mise à jour du diagramme
	 */
	$("body").on("change", "#chargeCorrections", function(){
		var valeur = $(this).val(),
			tache = ko.dataFor(this);
		if(vm.actionCreationTache() == false){
			var now = new Date().getTime();
			// ajout de la date de début des corrections
			if($.isNullOrEmpty(tache.dateDebutCorrection()) || now < tache.dateDebutCorrection()){
				tache.dateDebutCorrection(now);
			}
			// ajout de la date de fin des corrections
			tache.dateFinCorrection(now);
			// fn.miseAJourDiagramme(tache);
		}
		// vm.svgDataTaches.chiffrageCorrection(valeur);
	});
});