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
		if(fn.validation.creationTache(vm.gestionProjet.tachePointee())){
			if(vm.svgDataTaches.chiffrageInitial() != vm.gestionProjet.tachePointee().chiffrageInitial()){
				var now = new Date().getTime(),
					typeAction = ($.isNullOrEmpty(vm.svgDataTaches.chiffrageInitial())) ? vm.enums.CODE_ACTION_CHIFFRAGE : vm.enums.CODE_ACTION_RECHIFFRAGE,
					historique = fn.createHistorique(now, typeAction, null);
				vm.gestionProjet.tachePointee().historique.push(historique);
			}
			vm.gestionProjet.tachePointee(vm.newTache());
			vm.actionCreationTache(false);
			$("#modalTache").modal("hide");
		}
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
});