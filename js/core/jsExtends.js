/**
 * Extenders permettant de gérer correctement la copie d'un tableau observables
 */
(function($, ko) {
	"use strict";
	/**
	 * @param initValue function|object si c'est un objet le format est le suivant {initSize : int, initValue: function}
	 */
	ko.extenders.arrayTransformer = function (target, param) {
	  var initSize = 0, initValue = param,  result = ko.computed({
		  read : target,
		  write : function (value) {
			  if(typeof param !== "function"){
				  initSize = param.initSize||0;
				  initValue = param.initValue||function(){return null;}; // function
			  }
			  // initialise le tableau avec la taille donnée, et le contenu des cellules avec la fonction myInitValue
			  function prepareOutPutArray(myInitSize, myInitValue){
				  myInitSize = myInitSize || 0;
				  var i = null, outTab = [];
				  for(i = 0; i < myInitSize; i++){
					  outTab.push(myInitValue());
				  }
				  return outTab;
			  }
			  function transformCallback(value){
				  var optTemp = prepareOutPutArray(initSize, initValue), i;
				  if (value.length > 0) {
					 for (i = 0; i < value.length; i+=1){
						 optTemp[i] = initValue();
						 ko.jsam.copy(value[i], optTemp[i]);
					 }
				  }
				  return optTemp;
			  }

			  target(transformCallback(value));
		  }
	  });
	  result(target());
	  /**
	   * adds a new item to the end of array
	   *
	   * @param value
	   * @return void
	   */
	  result.push = function(value){
		  result().push(value);
		  result(result());
	  };
	  /**
	   * supprime le premier item qui est égal à key
	   *
	   * @param key string
	   * @return object|null
	   */
	  result.remove = function(key){
		  var cell = null;
		  if(key){
			  var i, arr = result();
			  for(i=0; i<arr.length; i++) {
				  if(arr[i] === key) {
					  cell = arr[i];
					  arr.splice(i, 1);
					  break;
				  }
			  }
			  result(arr);
		  }
		  return cell;
	  };
	  /**
	   * supprime toutes les cellules (remise à zero)
	   */
	  result.removeAll = function(){
		  result([]);
	  };
	  /**
	   * inserts a new item at the beginning of the array
	   *
	   * @param cell valeur à rajouter
	   * @return void
	   */
	  result.unshift = function(cell){
		  result().unshift(cell);
		  result(result());
	  };
	  /**
	   * removes the first value from the array and returns it
	   *
	   * @return object
	   */
	  result.shift = function(){
		  var cell = result().shift();
		  result(result());
		  return cell;
	  };
	  /**
	   * removes the last value from the array and returns it
	   *
	   * @return object
	   */
	  result.pop = function(){
		  var cell = result().pop();
		  result(result());
		  return cell;
	  };
	  /**
	   * retourne le type d'objets contenus dans l'array
	   * @return String
	   */
	  result.getType = function(){
	  	  if(result().length){
		  	return result()[0].constructor.name
		  }else{
		  	return null;
		  }
	  };
	  return result;
	};
}(jQuery, ko));

/**
* @name ModuleValidation
* @namespace
*/
(function($, ko) {
	/**
	Fonction de validation
	@name validate
	@memberOf ModuleValidation
	@param cible La cible (&eacute;l&eacute;ment) sur laquelle est appliqu&eacute;e la validation
	@param options pour un observable, le type de validation et le message d'erreur associ&eacute; (facultatif)
	* Liste des type de controle :
	* <ul>
	*   <li> required : champ requis</li>
	*   <li> formatAnnee : Chaine de 4 chiffres maximum au format '1234' (chiffres seulement)</li>
	*   <li> formatSix : chaine de 6 chiffres maximum au format '123456' (chiffres seulement)</li>
	*   <li> formatDateValide : date existante au format '11/11/1111' </li>
	*   <li> formatCaractere : chaine de cacrat�re (lettres seulement) ex : 'AbcRTgUI'</li>
	*   <li> formatChiffre : chaine de chiffres (chiffres seulement) ex : '932151210'</li>
	* </ul>
	*@example exemple d'utilisation : <br>
	* this.energie = ko.observable("").extend({validate: {required:"L'energie doit etre renseign&eacute;(e)"}}); <br>
	*self.validationRechercheVehicule = ko.observable().extend({validate: {ecran:"vehicule_rechercheVehicule"}});
	*/
	/**
	* @ignore
	*/
	"use strict";
	//Extension pour la validation d'un observable
	ko.extenders.validate = function(cible, options) {
	//On defini deux sous-observables
	// hasError => true ou false permet de savoir si l'observable est en erreur
	cible.hasError = ko.observable();
	// validationMessage => contient les messages d'erreur de l'observable si elles existent
	cible.validationMessage = ko.observableArray();
	//Fonction qui permet d'ajouter un message d'erreur a un observable
	cible.addError = function(message){
	var messagePresent = $.inArray(message, cible.validationMessage()) > -1;
	//On test si le message d'erreur est deja associe a l'observable
	if(!messagePresent){
	//Si il n'existe pas alors on l'associe a l'observable
	cible.hasError(true);
	cible.validationMessage.push(message);
	}
	};
	//Fonction qui permet de supprimer un message d'erreur a un observable
	cible.deleteAllError = function(){
	/*var messagePresent = $.inArray(message, cible.validationMessage()) > -1;
	//Si le message existe sur l'observabale
	if(messagePresent){
	//On le supprime
	cible.validationMessage.splice(cible.validationMessage.indexOf(message), 1);
	}*/
	cible.hasError(false);
	cible.validationMessage.splice(0,cible.validationMessage().length);
	};
	//Fonction de validation
	function validation(nouvelleValeur) {
	var message = [], erreur = false, i=null, msg;
	//On parcours toutes les regles
	for (i in ko.extenders.validate.rules) {
	if (ko.extenders.validate.rules.hasOwnProperty(i)) {
	//Si l'observable possede cette regle
	if (options[i]) {
	//On test la regle sur la valeur, si la regle est non verifiee
	if (ko.extenders.validate.rules[i].test(nouvelleValeur, options[i], cible)) {
	//On ajoute le message d'erreur personnalise defini dans l'observable
	erreur = true;
	msg = options[i].message;
	if(!msg){
	//Si il n'y a pas de message d'erreur personnalise, on recupere celui par defaut
	msg = ko.extenders.validate.rules[i].message;
	if(typeof(msg)==="function"){
	msg = msg(nouvelleValeur, options[i]);
	}
	}
	//On ajoute le message dans le tableau des messages
	message.push(msg);
	}
	}
	}
	}
	//On remplie la liste des messages d'erreurs
	cible.validationMessage(message);
	//On defini le sous observable hasError true (si des erreurs ont ete trouves)
	cible.hasError(erreur);
	}
	//Fonction qui permet d'executer la validation des l'initialisation
	validation(cible());
	// A chaque changement de valeur du champ, on execute la validation
	cible.subscribe(validation);
	return cible;
	};
	//Creation d'un conteneur de regle
	ko.extenders.validate.rules = {};
	/* ****************************************************************
	 *************  Definition des regles par defaut  *****************
	 **************************************************************** */
	//Regle qui definit un observable comme obligatoire
	ko.extenders.validate.rules.required = {
	test : function(nouvelleValeur, objOptions) {
	return !nouvelleValeur;
	},
	message : "Ce champ est requis"
	};
	//Regle qui definit un observable comme nombre (ex: 123  -1.23  5-3  0 ...)
	ko.extenders.validate.rules.nombre = {
	test : function(nouvelleValeur, objOptions) {
	if(nouvelleValeur){
	if (isNaN(nouvelleValeur)) {
	return true;
	}
	}
	return false;
	},
	message : "Ce champ doit etre un nombre (preferez le point a la virgule pour les nombres decimaux)"
	};
	//Regle qui definit observable comme nombre entier (ex : 2   3   1.0 ...)
	ko.extenders.validate.rules.nombreEntier = {
	test : function(nouvelleValeur, objOptions) {
	if(nouvelleValeur){
	if (!isNaN(nouvelleValeur)) {
	if((parseFloat(nouvelleValeur))!==(parseInt(nouvelleValeur, 10))){
	return true;
	}
	}
	}
	return false;
	},
	message : "Ce champ doit etre un nombre entier"
	};
	//Regle qui definit une valeur minimum d'un observable
	ko.extenders.validate.rules.min = {
	test : function(nouvelleValeur, objOptions) {
	if (nouvelleValeur && (!isNaN(nouvelleValeur))) {
	if(parseFloat(nouvelleValeur) < parseFloat(objOptions.val)){
	return true;
	}
	}
	return false;
	},
	message : "Il faut respecter la valeur minimum"
	};
	//Regle qui definit une valeur maximum d'un observable
	ko.extenders.validate.rules.max = {
	test : function(nouvelleValeur, objOptions) {
	if (nouvelleValeur && (!isNaN(nouvelleValeur))) {
	if(nouvelleValeur > objOptions.val){
	return true;
	}
	}
	return false;
	},
	message : "Il faut respecter la valeur maximum"
	};
	//Regle qui definit un nombre maximum de caractere pour un observable
	//Cette regle ne renvoie pas d'erreur car elle supprime directement
	//les caracteres en trop dans le champ
	ko.extenders.validate.rules.nbMaxCarac = {
	test : function(nouvelleValeur, objOptions, cible) {
	if (nouvelleValeur) {
	if(nouvelleValeur.length > objOptions.val){
	var longueur = nouvelleValeur.length;
	cible(nouvelleValeur.slice(0,longueur-1));
	}
	}
	return false;
	},
	message : ""
	};
	//Regle qui permet de tester une RegExp
	ko.extenders.validate.rules.customRegExp = {
	test : function(nouvelleValeur, objOptions) {
	var validformat = new RegExp(objOptions.regexp), e;
	if (nouvelleValeur) {
	e = validformat.test(nouvelleValeur);
	if (e) {
	return false;
	}
	}
	return true;
	},
	message : "Le champ n'est pas au bon format"
	};
	ko.extenders.validate.rules.formatDate = {
	test : function(nouvelleValeur, objOptions) {
	if (nouvelleValeur) {
	var validformat = new RegExp("^\\d{2}\\/\\d{2}\\/\\d{4}$"),e;
	e = validformat.test(nouvelleValeur);
	if (e) {
	//Si le format est verifie
	return false;
	}
	return true;
	}
	return false;
	},
	message : "La date doit etre au format JJ/MM/AAAA"
	};
	ko.extenders.validate.rules.dateValide = {
	test : function(nouvelleValeur, objOptions) {
	if (nouvelleValeur) {
	var OK = true,day,month,year,bissextile;
	//Dependance avec la regle sur le format de la date ("jj//mm/aaaa")
	if (!ko.extenders.validate.rules.formatDate.test(nouvelleValeur)) {
	day = nouvelleValeur.substring(0, 2);
	month = nouvelleValeur.substring(3, 5);
	year = nouvelleValeur.substring(6, 10);
	if (day.charAt(0) === "0" && day.length > 1){
	day = day.substring(1);
	}
	if (month.charAt(0) === "0" && month.length > 1){
	month = month.substring(1);
	}
	day = parseInt(day,10);
	month = parseInt(month,10);
	year = parseInt(year,10);
	/*if (OK === (year > 1900)) {*/
	if (OK === ((month <= 12) && (month > 0))) {
	bissextile = ((year % 4) === 0) && (((year % 100) !== 0) || ((year % 400) === 0));
	if (month === 2) {
	OK = bissextile ? day <= 29 : day <= 28;
	} else {
	if ((month === 4) || (month === 6)
	|| (month === 9) || (month === 11)) {
	OK = (day > 0 && day <= 30);
	} else {
	OK = (day > 0 && day <= 31);
	}
	}
	}else{
	OK = false;
	}
	/*}*/
	if (!OK) {
	// Le format de la date est respecte mais la date
	// n'est pas valide
	return true;
	}
	return false;
	}
	return false;
	}
	return false;
	},
	message : "La date doit etre valide"
	};
}(jQuery, ko));

(function($, ko) {
	 ko.extenders.numeric = function(target, precision) {
			//Creation d'un computed executé quand on accède à l'observable
			var result = ko.computed({
				//En lecture on renvoie la valeur de l'observable
				read: target,
				write: function(newValue) {
					var current = target();
					//Si la valeur change
					if(newValue){
						var  reg = new RegExp("^[0-9]*$", "g");
						//Si elle respecte la regex
						if(reg.test(newValue)){
							//On met à jour l'observable
							target(newValue);
						}else{
							//Sinon on notifie à tous les champs bindé la valeur de l'observable
							target.notifySubscribers(current);
						}
					}
				}
			});
			//initialize with current value to make sure it is rounded appropriately
			result(target());
			//return the new computed observable
			return result;
	};
}(jQuery, ko));

(function (factory) {
	"use strict";
	if (typeof define === 'function' && define.amd && define.amd.jQuery) {
	// AMD. Register as anonymous module.
	define(['jquery'], factory);
	} else {
	// Browser globals.
	factory(jQuery);
	}
}

(function ($) {
	"use strict";
	var pluses = /\+/g,
	config = {};
	function raw(s) {
	return s;
	}
	function decoded(s) {
	return decodeURIComponent(s.replace(pluses, ' '));
	}
	function converted(s) {
	if (s.indexOf('"') === 0) {
	// This is a quoted cookie as according to RFC2068, unescape
	s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
	}
	try {
	return config.json ? JSON.parse(s) : s;
	} catch(er) {}
	}
	config = $.cookie = function (key, value, options) {
		var decode,
			cookies,
			result,
			i,
			l,
			parts,
			name,
			cookie,
			days,
			t;
	// write
	if (value !== undefined) {
	options = $.extend({}, config.defaults, options);
	if (typeof options.expires === 'number') {
	days = options.expires;
	t = options.expires = new Date();
	t.setDate(t.getDate() + days);
	}
	value = config.json ? JSON.stringify(value) : String(value);
	return (document.cookie = [
	encodeURIComponent(key), '=', config.raw ? value : encodeURIComponent(value),
	options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
	options.path    ? '; path=' + options.path : '',
	options.domain  ? '; domain=' + options.domain : '',
	options.secure  ? '; secure' : ''
	].join(''));
	}
	// read
	decode = config.raw ? raw : decoded;
	cookies = document.cookie.split('; ');
	result = key ? undefined : {};
	for (i = 0, l = cookies.length; i < l; i+=1) {
	parts = cookies[i].split('=');
	name = decode(parts.shift());
	cookie = decode(parts.join('='));
	if (key && key === name) {
	result = converted(cookie);
	break;
	}
	if (!key) {
	result[name] = converted(cookie);
	}
	}
	return result;
	};
	config.defaults = {};
	$.removeCookie = function (key, options) {
	if ($.cookie(key) !== undefined) {
	$.cookie(key, '', $.extend(options, { expires: -1 }));
	return true;
	}
	return false;
	};
}));

(function($, location) {
	"use strict";
	/**
	 * Parse la chaine qui contient le paramètre "name" et retourne null si rien n'est trouvé
	 */
	$.urlParam = function(name, chaine) {
	chaine = chaine || location.search;
	var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(decodeURI(chaine));
	return results === null ? null : results[1] || null;
	};
}(jQuery, document.location));

// Gestion de la navigation
(function($, ko) {
	"use strict";
	/* ECRAN CLASS DEFINITION
	 * ====================== */
	var Container = function(element) {
	this.element = $(element);
	};
	function sendEvt(evtTarget, nomEvt, idEcran) {
	var e;
	e = $.Event(nomEvt + ".conteneur", {
	ecran : idEcran
	});
	evtTarget.trigger(e);
	return e;
	}
	Container.prototype = {
	constructor : Container,
	/**
	 *	Fonctions bas niveau
	 */
	load : function(id, vitesse) {
	vitesse = vitesse || "fast";
	var conteneur = $(this.element),
	suivant = $("#" + id),
	deferred,
	pos,
	strFrag;
	deferred = $.Deferred();
	if (suivant.length === 0) {
	sendEvt(conteneur, "load", id);
	pos = id.indexOf("_");
	strFrag = id;
	if (pos > -1) {
	strFrag = id.substring(0, pos);
	}
	$.get("ecrans/" + strFrag + ".html", function(data) {
	var fragHtml = $(data);
	conteneur.append(fragHtml);
	/*
	fragHtml.filter("*").each(function(i, obj) {
	ko.applyBindings(ko.dataFor(conteneur.get(0)), $(this).get(0));
	});
	*/
	sendEvt(conteneur, "loaded", id);
	deferred.resolve(id);
	}).fail(function(jqXHR, textStatus, errorThrown) {
	var e = sendEvt(conteneur, "error", id),
	idErr;
	if (!e.isDefaultPrevented()) {
	idErr = conteneur.children(".error").first().attr("id");
	conteneur.container("show", idErr, vitesse, false);
	}
	deferred.reject(id, textStatus, errorThrown);
	});
	}
	return deferred.promise();
	},
	show : function(id, vitesse, launchShowEvt) {
	vitesse = vitesse || "fast";
	var conteneur = $(this.element),
	suivant = $("#" + id),
	previous,
	e;
	launchShowEvt = launchShowEvt !== false;
	if(launchShowEvt) {
	sendEvt(conteneur, "show", id);
	}
	if (suivant.length === 0) {
	this.load(id, vitesse).done(function() {
	conteneur.container("show", id, vitesse, false);
	});
	} else {
	previous = conteneur.children("div.actif");
	e = sendEvt(conteneur, "hide", previous.attr("id"));
	if (!e.isDefaultPrevented()) {
	previous.fadeOut(vitesse, function() {
	previous.removeClass("actif");
	previous.css("display", "");
	sendEvt(conteneur, "hidden", previous.attr("id"));
	sendEvt(conteneur, "showDeprecated", id);
	$(suivant).fadeIn(vitesse, function() {
	suivant.addClass("actif");
	suivant.css("display", "");
	sendEvt(conteneur, "shown", id);
	});
	});
	}
	}
	}
	};
	/* PLUGIN FW Ecran
	 * ===================== */
	$.fn.container = function(option, id, param, param2, param3) {
	return this.each(function() {
	var $this = $(this), data = $this.data('container');
	if (!data) {
	$this.data('container', ( data = new Container(this)));
	}
	if ( typeof option === 'string') {
	return data[option](id, param, param2, param3);
	}
	});
	};
	$.fn.container.Constructor = Container;
}(jQuery, ko));

(function($) {
	"use strict";
	$(function() {
	// Composant navigation lineaire
	$("body").on("click", "a.fw-nav", function(e) {
	e.preventDefault();
	var href = $(this).attr('href'),
	pos,
	idSuivant;
	pos = href.indexOf("#");
	if (pos >= 0 && pos < href.length) {
	idSuivant = href.substring(pos +1);
	$(".conteneur").container("show", idSuivant, "fast");
	} else {
	e.preventDefault();
	}
	});
	// Composant onglet
	$("body").on("click", "a.onglet", function(e) {
	e.preventDefault();
	var href = $(this).attr('href'),
	pos = href.indexOf("#"),
	idSuivant;
	if (pos >= 0 && pos < href.length) {
	idSuivant = href.substring(pos + 1);
	$(".conteneur").container("show", idSuivant, "fast");
	} else {
	e.preventDefault();
	}
	});
//	// navigation
//	$(window).bind("hashchange", function(e) {
//	//e.preventDefault();
//	var prec = e.originalEvent.oldURL.replace(/^[^#]*/, ""),
//	suiv = e.originalEvent.newURL.replace(/^[^#]*/, ""),
//	precId = prec.substring(1),
//	suivId = suiv.substring(1);
//	//$(".conteneur").container("cacher");
//	//$(".conteneur").container("montrer", suivId);
//	});
	});
}(jQuery));

(function($, ko) {
	"use strict";
	$(function() {
	var $conteneur =  $(".conteneur"),
	garbage = $conteneur.data("conteneur-garbage");
	$.fn.container.garbage = [];
	function getStrFrag(id) {
	var pos = id.indexOf("_"),
	strFrag = id;
	if (pos > -1) {
	strFrag = id.substring(0, pos);
	}
	return strFrag;
	}
	function getFromTrash($ecran) {
	var id = $ecran.attr("id"),
	objGarbage = $.fn.container.garbage,
	i,
	$ecranFromTrash=null;
	for (i=0;i<objGarbage.length;i=i+1) {
	if (objGarbage[i].attr("id") === id) {
	// on enleve l'$ecran de garbage
	$ecranFromTrash = objGarbage.splice(i,1)[0];
	break;
	}
	}
	return $ecranFromTrash;
	}
	/**
	 * on met dans une corbeille virtuelle les ecrans précédemments bindés
	 * Si le nombre d'ecran dans la corbeille est superieure au nombre defini dans l'attribut data du conteneur ("data-conteneur-garbage")
	 * alors l'ecran est de-bindé (cleanNode)
	 *
	 * params
	 * $ecran : reference jQuery sur l'ecran à mettre dans la corbeille
	 * idCible : id de l'ecran suivant/cible dans la navigation
	 * nbMax : taille max de la corbeille
	 */
	function trash($ecran, nbMax) {
	if ($ecran.hasClass("ecran")) {
	var objGarbage = $.fn.container.garbage,
	$ecranTrash = getFromTrash($ecran),
	$old, e;
	// on retire $ecran de garbage
	if ($ecranTrash) {
	// on supprime le dernier
	$ecran = $ecranTrash;
	}
	// dans tous les cas, on (re)met l'$ecran dans garbage
	objGarbage.push($ecran);
	// si le seuil du garbage est atteint, on de-bind le plus ancien
	if (objGarbage.length > garbage) {
	// nettoyage
	$old = objGarbage.shift();
	ko.cleanNode($old.get(0));
	e = $.Event("garbage.conteneur", {
	ecran : $old.attr("id")
	});
	$conteneur.trigger(e);
	}
	}
	}
	function sendEvt(evtTarget, nomEvt, idEcran) {
	var e;
	e = $.Event(nomEvt + ".conteneur", {
	ecran : idEcran
	});
	evtTarget.trigger(e);
	return e;
	}
	function bindFragment(idFrag) {
	$('div[id^="' + idFrag + '"]').filter(".ecran").each(function(e, data) {
	$(data).filter("*").each(function(i, obj) {
	ko.applyBindings(ko.dataFor($conteneur.get(0)), $(this).get(0));
	});
	});
	}
	if (garbage) {
	// Prise en compte du data-conteneur-garbage
	$conteneur.on("show.conteneur", function(e) {
	// e.namespace aura forcement la valeur conteneur ou non defini (http://docs.jquery.com/Namespaced_Events)
	if(e.namespace) {
	var id = e.ecran, $ecranCible;
	// Si on cherche à aller vers un ecranCible déjà dans le garbage,
	// on l'enleve du garbage pour liberer une place
	$ecranCible = $("#" + id);
	$ecranCible = getFromTrash($ecranCible);
	if (!$ecranCible) {
	ko.applyBindings(ko.dataFor($conteneur.get(0)), $("#"+id).get(0));
	sendEvt($conteneur.get(0), "binded", id);
	}
	}
	});
	$conteneur.on("hide.conteneur", function(e) {
	// e.namespace aura forcement la valeur conteneur ou non defini (http://docs.jquery.com/Namespaced_Events)
	if(e.namespace) {
	// on met de cote l'ecran en passant egalement le nombre max d'ecrans
	// que l'on conservera (garbage)
	trash($("#" + e.ecran), garbage);
	}
	});
	} else {
	// comportement par defaut
	$conteneur.on("loaded.conteneur", function(e) {
	// e.namespace aura forcement la valeur conteneur ou non defini (http://docs.jquery.com/Namespaced_Events)
	if(e.namespace) {
	var strFrag = getStrFrag(e.ecran);
	bindFragment(strFrag);
	sendEvt($conteneur, "binded", e.ecran);
	}
	});
	}
	});
}(jQuery, ko));

(function($, ko) {
	"use strict";
	/**
	 * Maps des méthodes utilisées par les options (activer et déactiver)
	 */
	var applyMap = {
	UpPage : function() {
	window.scrollTo(0, 0);
	},
	BlockEscape : function() {
	$(window).bind('beforeunload', function(event) {
	return "L'ensemble des informations saisies seront perdues.";
	});
	}
	}, unApplyMap ={
	BlockEscape : function() {
	$(window).unbind('beforeunload');
	}
	};
	/**
	 * Nom du data-* pour énumérer les options Exemple :
	 * data-getDataOptionPage()="NomOption1 NomOption2 NomOption3"
	 */
	function getDataOptionPage() {
	return 'option-page';
	}
	/**
	 * Applique selon l'écran les méthodes en se basant sur les attributs "data-nomoption" ou "data-getDataOptionPage()"
	 */
	function run($ecran, apply) {
	apply = apply || false; // par défaut on déactive l'option
	if( !$ecran ) {
	return;
	}
	var opt = null, map = (apply === true) ? applyMap : unApplyMap;
	for (opt in map) {
	if (map.hasOwnProperty(opt)) {
	if ($ecran.data(opt.toLowerCase())
	|| ($ecran.data(getDataOptionPage()) && $ecran.data(
	getDataOptionPage()).indexOf(opt) !== -1)) {
	map[opt]();
	}
	}
	}
	}
	$(function() {
	var $conteneur = $(".conteneur");
	/**
	 * Mise en place des callbacks
	 */
	$conteneur.on("shown.conteneur", function(e) {
	if(e.namespace) {
	run($conteneur.find('#' + e.ecran), true);
	}
	});
	$conteneur.on("hidden.conteneur", function(e) {
	if(e.namespace) {
	run($conteneur.find('#' + e.ecran), false);
	}
	});
	/**
	 * Application des méthodes sur l'événement "onReady"
	 */
	run($conteneur.find('.actif'), true);
	});
}(jQuery, ko));

/**
 * Module permettant d'injecter des libellés via des balises span ayant un data-*="CODE_LIBELLE"
 */
(function($, window) {
	"use strict";
	var dataLibelle = "libelle", dictionnaireJsam = {
	OUI : "Oui",
	NON : "Non"
	};
	/**
	 * Affecte le libellé par rapport au code contenu dans le dictionaire
	 *
	 * @param $element noeud jQuery à traduire
	 * @param code clef du dictionnaire
	 * @param dictionnaire
	 * @return boolean
	 */
	function affecterLibelle($element, code, dictionnaire){
	var tmpValue = dictionnaire[code];
		if(tmpValue){ // est-ce présent dans le dictionnaire
			$element.text(tmpValue);
		}
		return !!tmpValue;
	}
	/**
	 * Recherche tous les éléments présentant un "data-libelle" et affecte un libellé
	 */
	function injecterLibelles($element){
	$element = $element || $(".conteneur");
	if(!$element){
	return;
	}
	var useDictionnaireJsam = null, dictionnaire = window.personnalisationLibelles;
	// pour chaque codeLibellé on regarde s'il n'est pas présent dans le dictionnaire sinon on utilise celui du module
	$element.find("span[data-"+dataLibelle+"]").each(function(){
	useDictionnaireJsam = true;
	if(dictionnaire){
	useDictionnaireJsam = !affecterLibelle($(this), $(this).data(dataLibelle), dictionnaire);
	}
	if(useDictionnaireJsam){
	affecterLibelle($(this), $(this).data(dataLibelle), dictionnaireJsam);
	}
	});
	}
	// onReady
	$(function(){
	injecterLibelles($(".conteneur"));
	});
	// loaded d'un fragment
	$(".conteneur").on("loaded.conteneur", function(e) {
	if(e.namespace && $(".conteneur")) {
	injecterLibelles($(".conteneur").find('#' + e.ecran));
	}
	});
	$("body").on("domUpdate", function(e){
	injecterLibelles($(e.target));
	});
}(jQuery, window));

/**
 * Modele "themes" permettant de charger dynamiquement les styles et les libellés d'un thème
 */
(function($) {
	"use strict";
	/**
	 * Paramètres par défaut pour la méthode load
	 */
	var defaults = {
	theme : null,
	done : null,
	fail : null
	},
	/**
	 * Identifiant dom pour la balise "style" qui va contenir l'ensemble des styles
	 */
	idStylesThemeTag = "styles_theme",
	/**
	 * Méthode utilisée lorsque le chargement du thème ne se passe pas bien
	 */
	processFail = function(callbackFail){
	$(".conteneur").show(); // par défaut on affiche l'état de l'application sans thème
	if(callbackFail){
	callbackFail();
	}
	},
	/**
	 * implémentation de la méthode load qui va charger le fichier CSS + JS
	 */
	load = function(theme, callbackDone, callbackFail){
	// si aucune balise "style" n'est définie, on applique "callbackFail"
	if(!$("#"+idStylesThemeTag).length){
	processFail(callbackFail);
	return;
	}
	$.when(
			$.ajax("themes/"+theme+"/theme_"+theme+".css", {cache:true}),
			$.ajax({
				url:"themes/"+theme+"/theme_"+theme+".js",
				dataType: "script",
				cache:true,
				success : function(script, textStatus, jqXHR){
					$("body").trigger("domUpdate");
				}
			})).then(function(){
		$("#"+idStylesThemeTag).attr("href", "themes/"+theme+"/theme_"+theme+".css");

	$(".conteneur").show();
	if(callbackDone){
	callbackDone();
	}
	}, function(){
	processFail(callbackFail);
	});
	};
	// exposition du plugin sous la forme $.themes
	$.extend({
	 themes: function(options){
			var settings = {};
			$.extend(settings, defaults, options);
			// si le plugin est activé on masque le conteneur si ce n'est pas déjà fait
			if($(".conteneur").is(":visible")){
				 $(".conteneur").hide();
			}
	if(settings.theme){ // le thème est obligatoire
	load(settings.theme, settings.done, settings.fail);
	}
	}
	});
 }(jQuery));

/*
objectifs :
	- avoir un outil de copy/mapping de donnees pouvant etre utilise avec les observables.
	- pouvoir encapsuler cet outil dans l'implementation des ressources Rest dans le framework js@m
	- permettre la mise a jour d'une portion de vueModel depuis un service dedie ou depuis un flux JSON brut (raw/pojo)

Principes de base :
	- dans un objet, un chemin d'acces a une donnee peut parcourir un ou plusieurs observables
	- on met a jour uniquement les elements finaux dans une grappe d'objets, pour 2 donnees qui match un chemin exact
		elements mis a jour : string, number, boolean, date, observable
	- on travaille donc toujours sur les elements "feuilles" d'objets, on ne met pas a jour les objets intermediaires
	- le mapping ne cree jamais d'observable, il se sert uniquement des observables deja existants
	- Dans le cas des tableaux :
		- on ne fait pas de mise a jour de tableau, on reinitialise entierement le contenu des tableaux, observables ou non
		- on ne met jamais de donnees observabilisees dans un tableau, toujours en brut

	Si besoin de modification d'un tableau, toujours passer par un observable intermediaire (subscribe sur event : beforeChange)
*/
(function (ko) {
	"use strict";
   function setValue(dest, prop, value) {
	   switch(ko.jsam.utils.getType(dest[prop])) {
		   case "observable" :
				/* ko.isWriteableObservable - returns true for observable,
				 * observableArrays, and writeable computed observables
				 **/
				if (ko.isWriteableObservable(dest[prop])) {
					dest[prop](value);
				}
				break;
		   case "date" :
				/*
				 * TODO
				 */
				throw new Error("a faire socle");
				//break;
		   default :
				dest[prop] = value;
				break;
	   }
   }
	function copy(source, dest) {
		var prop=null, typeSource;
		typeSource = ko.jsam.utils.getType(source);
		if (typeSource === "object") {
			if (ko.isObservable(dest)) {
				dest = dest();
			}
			for(prop in source) {
				if(source.hasOwnProperty(prop) && ko.jsam.utils.getType(source[prop]) !== "function") {
					// attention observable et function sont consideres differents
					// appel recursif
					// si type simple (string, number, boolean, date, function)
					if (dest.hasOwnProperty(prop)) {
						switch(ko.jsam.utils.getType(source[prop])) {
							case "observable" :
									if (ko.jsam.utils.getType(source[prop]()) === "object") {
										copy(source[prop](), dest[prop]);
									} else {
										setValue(dest, prop, source[prop]());
									}
									break;
							case "object" :
								if(source[prop] === null) {
									setValue(dest, prop, source[prop]);
								} else {
									copy(source[prop], dest[prop]);
								}
									break;
							default :
									setValue(dest, prop, source[prop]);
									break;
						}
					} else {
						throw new Error("[copy] la propriete " + prop + " n\'existe pas dans l'objet destination");
					}
				}
			}
		} else if (typeSource === "array") {
			if (ko.isObservable(dest)) {
				dest(source);
			} else {
				dest = source;
			}
		} else {
			// on ne leve une exception que si on a une source
			if (source) {
				throw new Error("[copy] l'objet " + dest + " n\'a pas ete mis a jour");
			}
		}
	}
	/* fonctions a exporter */
	ko.jsam = ko.jsam || {};
	ko.jsam.copy = copy;
}(ko));

(function($, ko) {
	"use strict";
	ko.jsam = ko.jsam || {};
	function showDataException(responseText, $screen){
	if(!responseText){
	return;
	}
	var dataException = null;
	try{
	dataException = JSON.parse(responseText);
	}catch(e){
	return;
	}
	if($screen.find(".requestId")){
	$screen.find(".requestId").text(dataException.requestid || '');
	}
	if($screen.find(".message")){
	$screen.find(".message").text(dataException.message || '');
	}
	if($screen.find(".type")){
	$screen.find(".type").text(dataException.type || '');
	}
	}
	ko.jsam.defaultStatusCode = {
	"4xx" : function(jqXHR, textStatus, errorThrown) {
	var $conteneur = $(".conteneur"), $erreur = $("#erreur4xx");
	if ($conteneur && $erreur.length) {
	$conteneur.container("show", "erreur4xx");
	showDataException(jqXHR.responseText, $erreur);
	}
	if(ko.jsam.defaultStatusCode["4xx_custom"] && typeof ko.jsam.defaultStatusCode["4xx_custom"] === "function"){
				ko.jsam.defaultStatusCode["4xx_custom"](jqXHR, textStatus, errorThrown);
			}
	},
	"5xx" : function(jqXHR, textStatus, errorThrown) {
	var $conteneur = $(".conteneur"), $erreur = $("#erreur5xx");
	if ($conteneur && $erreur.length) {
	$conteneur.container("show", "erreur5xx");
	showDataException(jqXHR.responseText, $erreur);
	}
	if(ko.jsam.defaultStatusCode["5xx_custom"] && typeof ko.jsam.defaultStatusCode["5xx_custom"] === "function"){
				ko.jsam.defaultStatusCode["5xx_custom"](jqXHR, textStatus, errorThrown);
			}
	}
	};
}(jQuery, ko));

(function(ko, $) {"use strict";
		function rest(dataModel, context) {
			// The main object
			var newDataModel = dataModel, item, uri = "", accepts = "";
			context = context || "body";
			item = newDataModel || {};
			/* les informations liees a rest sont regroupees dans un module independant
			 * cela permet d'acceder aux attributs uniquement au travers d'accesseurs
			 * en plus de mettre en place une notion de variable privee,
			 * cela permet de ne pas attacher de variable de type primitif directement sur l'item.
			 * Cela nous permet donc de pouvoir utiliser JSON.parse sur un item contenant d'autres
			 * item rest sans que cela ne soit présent dans le flux JSON serialise.
			 */
			function beforeSend(xhr, settings) {
				$(context).trigger("beforesend.rest", [settings.type, settings.url]);
				if (window.jsam && window.jsam.authentication) {
					var authorization = window.jsam.authentication.authorization;
					if (authorization) {
						xhr.setRequestHeader("Authorization", "Basic " + authorization);
					}
				}
				if(window.jsam && window.jsam.sessionId && window.jsam.sessionId !== ""){
					xhr.setRequestHeader("x-sessionid", window.jsam.sessionId);
				}
			}
			function handleResponse(restDeferred) {
				var statusMap = {};
				/*
				 *  gestion des codes status unitairement
				 * Cette méthode a differentes signatures
				 */
				restDeferred.statusCode = function(obj, callBack) {
					var status = null, statusMin, statusMax, map;
					if ( typeof (obj) === "object") {
						// signature statusCode(map)
						map = obj;
						for (status in map) {
							if (map.hasOwnProperty(status)) {
								restDeferred.statusCode(status, map[status]);
							}
						}
					} else {
						// signature statusCode(status, callBack)
						// exemple de status : 200 | 400 | 4xx
						status = obj;
						if (/^[0-9]xx$/.test(status)) {
							statusMin = parseInt(status.substring(0, 1), 10) * 100;
							statusMax = statusMin + 99;
						} else {
							statusMin = parseInt(status, 10);
							statusMax = statusMin;
						}
						(statusMap[status] = statusMap[status] || []).push(callBack);
						if (statusMin < 400) {
							restDeferred.done(function(data, textStatus, jqXHR) {
								if (statusMin <= jqXHR.status && jqXHR.status <= statusMax) {
									callBack(data, textStatus, jqXHR);
								}
							});
						} else {
							restDeferred.fail(function(jqXHR, textStatus, errorThrown) {
								if (statusMin <= jqXHR.status && jqXHR.status <= statusMax) {
									callBack(jqXHR, textStatus, errorThrown);
								}
							});
						}
					}
					return restDeferred;
				};
				/*
				 * Gestion des codes status par blocs (2xx / 4xx, 5xx)
				 */
				restDeferred.ok = function(callBack) {
					// signature callBack(data, textStatus, jqXHR)
					return restDeferred.statusCode("2xx", callBack);
				};
				restDeferred.clientError = function(callBack) {
					// signature callBack(jqXHR, textStatus, errorThrown)
					return restDeferred.statusCode("4xx", callBack);
				};
				restDeferred.serverError = function(callBack) {
					// signature callBack(jqXHR, textStatus, errorThrown)
					return restDeferred.statusCode("5xx", callBack);
				};
				/**
				 * Retourne vrai s'il existe un client ou server error dans statusMap (4?? ou 5??) pour la gestion EXPLICITE des erreurs
				 *
				 * @return boolean
				 */
				function existsClientServerError(clientError){
					var status = clientError ? "4xx" :"5xx", statusRegistered = null, pattern = clientError ? /^4[0-9]{2}$/ : /^5[0-9]{2}$/;
					if(statusMap[status] && statusMap[status].length > 1){ // 4?? ou 5?? est manipulé pour la gestion EXPLICITE
						return true;
					}
					for(statusRegistered in statusMap){
						if(statusMap.hasOwnProperty(statusRegistered) && pattern.test(statusRegistered)) {
						   return true;
						}
					}
					return false;
				}
				/**
				 * Enregistrement des callbacks pour la gestion implicite des erreurs
				 * Par défaut on affiche un des écrans "erreur4xx" ou "erreur5xx" en fonction de l'erreur
				 */
				restDeferred.statusCode("4xx", function(jqXHR, textStatus, errorThrown) {
					if(!existsClientServerError(true)){
						if (ko.jsam.defaultStatusCode && ko.jsam.defaultStatusCode["4xx"]) {
							ko.jsam.defaultStatusCode["4xx"](jqXHR, textStatus, errorThrown);
						}
					}
				});
				restDeferred.statusCode("5xx", function(jqXHR, textStatus, errorThrown) {
					if(!existsClientServerError(false)){
						if (ko.jsam.defaultStatusCode && ko.jsam.defaultStatusCode["5xx"]) {
							ko.jsam.defaultStatusCode["5xx"](jqXHR, textStatus, errorThrown);
						}
					}
				});
				return restDeferred;
			}
			/**
			 * Envoi un événement générique lors de la réponse
			 */
			function handleGlobalResponse(methode, urlSource, textStatus) {
				$(context).trigger("response.rest", [methode, urlSource, textStatus]);
			}
			// récupération du sessionId
			function provideSessionId(jqXhr){
				if(jqXhr && jqXhr.getResponseHeader && window.jsam && (window.jsam.sessionId === "") && jqXhr.getResponseHeader("x-sessionid")){
					window.jsam.sessionId = jqXhr.getResponseHeader("x-sessionid");
				}
			}
			// The GET method, reads an element from an URL and updates the model
			item.Get = function(url) {
				var urlSource = ko.jsam.utils.getUrl(uri, url), restDeferred = $.Deferred(), ajax = $.ajax({
					type : 'GET',
					contentType : "application/json",
					dataType : "json",
					url : urlSource,
					beforeSend : beforeSend
				}).done(function(data, textStatus, jqXHR) {
					ko.jsam.copy(data, item);
					$(context).trigger("200.rest", ["Get", urlSource]);
					provideSessionId(jqXHR);
					restDeferred.resolve(data, textStatus, jqXHR);
				}).fail(function(jqXHR, textStatus, errorThrown) {
					$(context).trigger("fail.rest", ["Get", urlSource]);
					provideSessionId(jqXHR);
					restDeferred.reject(jqXHR, textStatus, errorThrown);
				}).always(function(datajqXHR, textStatus, jqXHRerrorThrown) {
					handleGlobalResponse("Get", urlSource, textStatus);
				});
				return handleResponse(restDeferred);
			};
			// The POST method, adds an element to an URL and updates the model
			item.Post = function(url, pItemDestination) {
				var itemDestination = pItemDestination || item, urlSource = ko.jsam.utils.getUrl(uri, url), restDeferred = $.Deferred(), ajax = $.ajax({
					type : "POST",
					url : urlSource,
					contentType : "application/json",
					dataType : "json",
					data : ko.toJSON(item),
					beforeSend : beforeSend
				}).done(function(data, textStatus, jqXHR) {
					if (jqXHR.status === 200) {
						ko.jsam.copy(data, itemDestination);
						$(context).trigger("200.rest", ["Post", urlSource]);
					} else if (jqXHR.status === 201) {
						itemDestination.setUri(jqXHR.getResponseHeader("Location"));
						$(context).trigger("201.rest", ["Post", urlSource]);
					}
					provideSessionId(jqXHR);
					restDeferred.resolve(data, textStatus, jqXHR);
				}).fail(function(jqXHR, textStatus, errorThrown) {
					$(context).trigger("fail.rest", ["Post", urlSource]);
					provideSessionId(jqXHR);
					restDeferred.reject(jqXHR, textStatus, errorThrown);
				}).always(function(datajqXHR, textStatus, jqXHRerrorThrown) {
					handleGlobalResponse("Post", urlSource, textStatus);
				});
				return handleResponse(restDeferred);
			};
			// The PUT method, updates an element to an URL and updates the model
			item.Put = function(url) {
				var urlSource = ko.jsam.utils.getUrl(uri, url), restDeferred = $.Deferred(), ajax = $.ajax({
					type : "PUT",
					url : urlSource,
					contentType : "application/json",
					dataType : "json",
					data : ko.toJSON(item),
					beforeSend : beforeSend
				}).done(function(data, textStatus, jqXHR) {
					if (jqXHR.status === 201) {
						ko.jsam.copy(data, item);
						$(context).trigger("201.rest", ["Put", urlSource]);
					}
					provideSessionId(jqXHR);
					restDeferred.resolve(data, textStatus, jqXHR);
				}).fail(function(jqXHR, textStatus, errorThrown) {
					$(context).trigger("fail.rest", ["Put", urlSource]);
					provideSessionId(jqXHR);
					restDeferred.reject(jqXHR, textStatus, errorThrown);
				}).always(function(datajqXHR, textStatus, jqXHRerrorThrown) {
					handleGlobalResponse("Put", urlSource, textStatus);
				});
				return handleResponse(restDeferred);
			};
			// The DELETE method, deletes an element from an URL
			item.Delete = function(url) {
				var urlSource = ko.jsam.utils.getUrl(uri, url), restDeferred = $.Deferred(), ajax = $.ajax({
					type : "DELETE",
					url : urlSource,
					contentType : "application/json",
					dataType : "json",
					beforeSend : beforeSend
				}).done(function(data, textStatus, jqXHR) {
					ko.jsam.copy(data, item);
					$(context).trigger("success.rest", ["Delete", urlSource]);
					provideSessionId(jqXHR);
					restDeferred.resolve(data, textStatus, jqXHR);
				}).fail(function(jqXHR, textStatus, errorThrown) {
					$(context).trigger("fail.rest", ["Delete", urlSource]);
					provideSessionId(jqXHR);
					restDeferred.reject(jqXHR, textStatus, errorThrown);
				}).always(function(datajqXHR, textStatus, jqXHRerrorThrown) {
					handleGlobalResponse("Delete", urlSource, textStatus);
				});
				return handleResponse(restDeferred);
			};
			// ajout des accesseurs
			item.setUri = function(pUri) {
				uri = pUri;
			};
			item.getUri = function() {
				return uri;
			};
			item.setAccepts = function(pAccepts) {
				accepts = pAccepts;
			};
			item.getAccepts = function() {
				return accepts;
			};
			return item;
		}
		/* binding ko */
		ko.bindingHandlers.resource = {
			init : function(element, valueAccessor, allBindingsAccessor, viewModel) {
				var link = $(element), resource = valueAccessor();
				if (resource.setUri) {
					resource.setUri(link.attr("href"));
				}
				if (resource.setAccepts) {
					resource.setAccepts(link.attr("type"));
				}
			},
			update : function(element, valueAccessor, allBindingsAccessor, viewModel) {
			}
		};
		/* fonctions a  exporter */
		ko.jsam = ko.jsam || {};
		ko.jsam.rest = rest;
}(ko, jQuery));

(function (ko) {
	"use strict";
	/* fonctions utilitaires */
	function getType(x) {
		if ((x) && (typeof (x) === "object")) {
			if (x.constructor === Date) {
				return "date";
			}
			if (x.constructor === String) {
				return "string";
			}
			if (Object.prototype.toString.call(x) === "[object Array]") {
				return "array";
			}
		}
		if (ko.isObservable(x)) {
			return "observable";
		}
		return typeof x;
	}
	function isObjectComplex(x) {
		var type = getType(x);
		return (type === "array" || (type === "object" && type !== "date"));
	}
	function getUrl(uri, url) {
		var uriResult = uri;
		if (url) {
			uriResult = uri + url;
		}
		return uriResult;
	}
	/**
	 * Utilisé pour retirer un élément d'un tableau
	 */
	function removeOfArray(arr, val) {
		var i;
		for(i=0; i<arr.length; i++) {
			if(arr[i] === val) {
				arr.splice(i, 1);
				break;
			}
		}
		return arr;
	}
	/* fonctions a  exporter */
	ko.jsam = ko.jsam || {};
	ko.jsam.utils = ko.jsam.utils || {};
	ko.jsam.utils.isObjectComplex = isObjectComplex;
	ko.jsam.utils.getType = getType;
	ko.jsam.utils.getUrl = getUrl;
	ko.jsam.utils.removeOfArray = removeOfArray;
}(ko));

(function($, ko) {
	"use strict";
	var updateChecked = ko.bindingHandlers.checked.update;
	ko.bindingHandlers.checked.update = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
	if(updateChecked) {
	//On execute la fonction update du binding foreach
	updateChecked(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
	}
	setTimeout(function(){
	//L'element qui a mis a jour le foreach emet l'evenement domUpdate (pour gerer le cycle de vie des composants)
	$(element).trigger("domUpdate");
	});
	};
}(jQuery, ko));

(function($, ko) {
	"use strict";
	var updateEnable = ko.bindingHandlers.enable.update;
	ko.bindingHandlers.enable =  {
	update : function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
	$(element).attr("data-enable", valueAccessor());
	updateEnable(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
	setTimeout(function(){
	//L'element qui a mis a jour le foreach emet l'evenement domUpdate (pour gerer le cycle de vie des composants)
	$(element).trigger("domUpdate");
	});
	}
	};
}(jQuery, ko));

(function($, ko) {
	"use strict";
	var updateForEach = ko.bindingHandlers.foreach.update;
	//On surcharge l'update du binding foreach
	ko.bindingHandlers.foreach.update = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
	if(updateForEach) {
	//On execute la fonction update du binding foreach
	updateForEach(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
	}
	setTimeout(function(){
	//L'element qui a mis a jour le foreach emet l'evenement domUpdate (pour gerer le cycle de vie des composants)
	$(element).trigger("domUpdate");
	});
	};
}(jQuery, ko));

(function($, ko) {
	"use strict";
	var updateIf = ko.bindingHandlers["if"].update;
	ko.bindingHandlers["if"].update = function(element, valueAccessor,
	allBindingsAccessor, viewModel, bindingContext) {
	if (updateIf) {
	// On execute la fonction update du binding if
	updateIf(element, valueAccessor, allBindingsAccessor, viewModel,
	bindingContext);
	}
	setTimeout(function() {
	// L'element qui a mis a jour le if emet l'evenement domUpdate
	// (pour gerer le cycle de vie des composants)
	$(element).trigger("domUpdate");
	});
	};
}(jQuery, ko));

(function($, ko) {
	"use strict";
	// On surcharge l'update du binding pour items
	ko.bindingHandlers.items = {
	// Méthode interne de gestion des éléments
	doChildren : function (element, liste, isLeaf, label, children) {
	var counter = 0, item, childs, t, opt, optgr, labels = label.split(","), values, labelIter;
	for (counter = 0; counter < liste.length; counter+=1) {
	item = ko.utils.unwrapObservable(liste[counter]);
	for (labelIter in labels) {
	values = item[$.trim(labels[labelIter])];
	if (values) {
	break;
	}
	}
	//item[label]
	t = ko.utils.unwrapObservable(values);
	childs = ko.utils.unwrapObservable(item[children]);
	if (isLeaf(item)) {
	   opt = document.createElement('option');
	   $(element).append(opt);
	   $(opt).append(t);
	   ko.selectExtensions.writeValue(opt, item);
	} else {
	   optgr = document.createElement('optgroup');
	   $(element).append(optgr);
	   $(optgr).attr('label', t);
	   ko.bindingHandlers.items.doChildren(optgr, childs, isLeaf, label, children);
	   $(element).append("</optgroup>\n");
	}
	}
	},
	update: function(element, valueAccessor, allBindingsAccessor, vueModel, bindingContext) {
	var value = ko.utils.unwrapObservable(valueAccessor()), liste = ko.utils.unwrapObservable(value.list()),
	isLeaf = ko.utils.unwrapObservable(value.isLeaf), label = ko.utils.unwrapObservable(value.label),
	children = ko.utils.unwrapObservable(value.children);
	$(element).html('');
	ko.bindingHandlers.items.doChildren(element, liste, isLeaf, label, children);
	setTimeout(function(){
	//L'element qui a mis a jour le foreach emet l'evenement domUpdate (pour gerer le cycle de vie des composants)
	$(element).trigger("domUpdate");
	});
	}
	};
}(jQuery, ko));

(function($, ko) {
	"use strict";
	// On surcharge l'update du binding pour items
	ko.bindingHandlers.navigateTo = {
	buildUrl : function(uri, params) {
	var oldUrl, newUrl, path, param;
	$.removeCookie($.socleBureau.getNameIdSocle());
	if (uri.indexOf('/')>=0) {
	return ;
	}
	oldUrl = window.location.href;
	path = oldUrl.substring(0, oldUrl.lastIndexOf('/')+1);
	newUrl = path+uri;
	if (params) {
	newUrl += "?"
	for (param in params) {
				if(params.hasOwnProperty(param) && ko.jsam.utils.getType(params[param]) !== "function") {
	newUrl += "&"+param+"="+ko.utils.unwrapObservable(params[param]);
	}
	}
	if ($.socleBureau.getConnecteur() && $.socleBureau.getConnecteur().id) {
	newUrl += '&'+$.socleBureau.getNameIdSocle()+'='+$.socleBureau.getConnecteur().id;
	}
	} else {
	if ($.socleBureau.getConnecteur() && $.socleBureau.getConnecteur().id) {
	newUrl += "?"+$.socleBureau.getNameIdSocle()+'='+$.socleBureau.getConnecteur().id;
	}
	}
	return newUrl;
	},
	appendSocleId : function (element) {
	var par = $.socleBureau.getNameIdSocle(), url = element.href;
	if ($.socleBureau.getConnecteur().id) {
	if (url.lastIndexOf(par)>=0) {
	url = url.substring(0,url.lastIndexOf(par));
	url += par+'='+$.socleBureau.getConnecteur().id;
	} else if ( url.indexOf('?')<=0){
	url += '?'+par+'='+$.socleBureau.getConnecteur().id;
	} else {
	url += '&'+par+'='+$.socleBureau.getConnecteur().id;
	}
	element.href = url;
	}
	},
	init : function(element, valueAccessor, allBindingsAccessor, vueModel, bindingContext) {
	$.socleBureau.onSocleReady(function () {
	ko.bindingHandlers.navigateTo.appendSocleId(element);
	})
	$(element).click(function () {
	var href = $(element).attr('href');
		window.location.href = href;
	});
	},
	update: function(element, valueAccessor, allBindingsAccessor, vueModel, bindingContext) {
	var value = ko.utils.unwrapObservable(valueAccessor()),
	uri = ko.utils.unwrapObservable(value.dest), params;
	if (value.params) {
	params = ko.utils.unwrapObservable(value.params);
	}
	element.href = ko.bindingHandlers.navigateTo.buildUrl(uri, params);
	setTimeout(function(){
	//L'element qui a mis a jour le foreach emet l'evenement domUpdate (pour gerer le cycle de vie des composants)
	$(element).trigger("domUpdate");
	});
	}
	};
}(jQuery, ko));

(function($, ko) {
	"use strict";
	var updateOptions = ko.bindingHandlers.options.update;
	//On surcharge l'update du binding options
	ko.bindingHandlers.options.update = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
	if(updateOptions) {
	//On execute la fonction update du binding options
	updateOptions(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
	}
	setTimeout(function(){
	//L'element qui a mis a jour les options emet l'evenement domUpdate (pour gerer le cycle de vie des composants)
	$(element).trigger("domUpdate");
	});
	};
}(jQuery, ko));

(function($, ko) {
	"use strict";
	var updateValue = ko.bindingHandlers.value.update;
	ko.bindingHandlers.value.update = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
	if(updateValue) {
	//On execute la fonction update du binding foreach
	updateValue(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
	}
	setTimeout(function(){
	//L'element qui a mis a jour le foreach emet l'evenement domUpdate (pour gerer le cycle de vie des composants)
	$(element).trigger("domUpdate");
	});
	};
}(jQuery, ko));

(function($, ko) {
	"use strict";
	ko.extenders.pmSender = function(target, option) {
	target.auto = option.auto;
	target.send = function() {
	$.pm({
	target: option.parent || window.parent,
	url: option.url || document.referrer,
	type: option.type,
	data: target()
	});
	};
	target.subscribe(function(newValue) {
	if (target.auto === true) {
	target.send();
	}
	});
		return target;
	};
	ko.extenders.pmReceiver = function(target, option) {
	$.pm.bind(option.type, function(data) {
	target(data);
	});
		return target;
	};
}(jQuery, ko));

/**
 The MIT License
 Copyright (c) 2010 Daniel Park (http://metaweb.com, http://postmessage.freebaseapps.com)
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 **/
var NO_JQUERY = {};
(function(window, $, undefined) {
	 if (!("console" in window)) {
		 var c = window.console = {};
		 c.log = c.warn = c.error = c.debug = function(){};
	 }
	 if ($ === NO_JQUERY) {
		 // jQuery is optional
		 $ = {
			 fn: {},
			 extend: function(a) {
				 var i, prop, b;
				 for (i=1,len=arguments.length; i<len; i = i+1) {
					 b = arguments[i];
					 for (prop in b) {
						 if(b.hasOwnProperty(prop)) {
							a[prop] = b[prop];
						 }
					 }
				 }
				 return a;
			 }
		 };
	 }
	 $.fn.pm = function() {
		 return this;
	 };
	 // send postmessage
	 $.pm = window.pm = function(options) {
		 pm.send(options);
	 };
	 // bind postmessage handler
	 $.pm.bind = window.pm.bind = function(type, fn, origin, hash, async_reply) {
		 pm.bind(type, fn, origin, hash, async_reply === true);
	 };
	 // unbind postmessage handler
	 $.pm.unbind = window.pm.unbind = function(type, fn) {
		 pm.unbind(type, fn);
	 };
	 // default postmessage origin on bind
	 $.pm.origin = window.pm.origin = null;
	 // default postmessage polling if using location hash to pass postmessages
	 $.pm.poll = window.pm.poll = 200;
	 var pm = {
		 send: function(options) {
			 var o = $.extend({}, pm.defaults, options),
			 target = o.target;
			 if (!o.target) {
				 console.warn("postmessage target window required");
				 return;
			 }
			 if (!o.type) {
				 console.warn("postmessage type required");
				 return;
			 }
			 var msg = {data:o.data, type:o.type};
			 if (o.success) {
				 msg.callback = pm._callback(o.success);
			 }
			 if (o.error) {
				 msg.errback = pm._callback(o.error);
			 }
			 if (("postMessage" in target) && !o.hash) {
				 pm._bind();
				 target.postMessage(JSON.stringify(msg), o.origin || '*');
			 }
			 else {
				 pm.hash._bind();
				 pm.hash.send(o, msg);
			 }
		 },
		 bind: function(type, fn, origin, hash, async_reply) {
		   pm._replyBind ( type, fn, origin, hash, async_reply );
		 },
		 _replyBind: function(type, fn, origin, hash, isCallback) {
		   if (("postMessage" in window) && !hash) {
			   pm._bind();
		   }
		   else {
			   pm.hash._bind();
		   }
		   var l = pm.data("listeners.postmessage");
		   if (!l) {
			   l = {};
			   pm.data("listeners.postmessage", l);
		   }
		   var fns = l[type];
		   if (!fns) {
			   fns = [];
			   l[type] = fns;
		   }
		   fns.push({fn:fn, callback: isCallback, origin:origin || $.pm.origin});
		 },
		 unbind: function(type, fn) {
			 var l = pm.data("listeners.postmessage"), i, m;
			 if (l) {
				 if (type) {
					 if (fn) {
						 // remove specific listener
						 var fns = l[type];
						 if (fns) {
							 m = [];
							 for (i=0,len=fns.length; i<len; i++) {
								 var o = fns[i];
								 if (o.fn !== fn) {
									 m.push(o);
								 }
							 }
							 l[type] = m;
						 }
					 }
					 else {
						 // remove all listeners by type
						 delete l[type];
					 }
				 }
				 else {
					 // unbind all listeners of all type
					 for (i in l) {
					   delete l[i];
					 }
				 }
			 }
		 },
		 data: function(k, v) {
			 if (v === undefined) {
				 return pm._data[k];
			 }
			 pm._data[k] = v;
			 return v;
		 },
		 _data: {},
		 _CHARS: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
		 _random: function() {
			 var r = [], i;
			 for (i=0; i<32; i++) {
				 r[i] = pm._CHARS[0 | Math.random() * 32];
			 };
			 return r.join("");
		 },
		 _callback: function(fn) {
			 var cbs = pm.data("callbacks.postmessage");
			 if (!cbs) {
				 cbs = {};
				 pm.data("callbacks.postmessage", cbs);
			 }
			 var r = pm._random();
			 cbs[r] = fn;
			 return r;
		 },
		 _bind: function() {
			 // are we already listening to message events on this w?
			 if (!pm.data("listening.postmessage")) {
				 if (window.addEventListener) {
					 window.addEventListener("message", pm._dispatch, false);
				 }
				 else if (window.attachEvent) {
					 window.attachEvent("onmessage", pm._dispatch);
				 }
				 pm.data("listening.postmessage", 1);
			 }
		 },
		 _dispatch: function(e) {
			 //console.log("$.pm.dispatch", e, this);
			 try {
				 var msg = JSON.parse(e.data);
			 }
			 catch (ex) {
				 console.warn("postmessage data invalid json: ", ex);
				 return;
			 }
			 if (!msg.type) {
				 console.warn("postmessage message type required");
				 return;
			 }
			 var cbs = pm.data("callbacks.postmessage") || {},
			 cb = cbs[msg.type];
			 if (cb) {
				 cb(msg.data);
			 }
			 else {
				 var l = pm.data("listeners.postmessage") || {};
				 var fns = l[msg.type] || [];
				 for (var i=0,len=fns.length; i<len; i++) {
					 var o = fns[i];
					 if (o.origin && o.origin !== '*' && e.origin !== o.origin) {
						 console.warn("postmessage message origin mismatch", e.origin, o.origin);
						 if (msg.errback) {
							 // notify post message errback
							 var error = {
								 message: "postmessage origin mismatch",
								 origin: [e.origin, o.origin]
							 };
							 pm.send({target:e.source, data:error, type:msg.errback});
						 }
						 continue;
					 }
					 function sendReply ( data ) {
					   if (msg.callback) {
						   pm.send({target:e.source, data:data, type:msg.callback});
					   }
					 }
					 try {
						 if ( o.callback ) {
						   o.fn(msg.data, sendReply, e);
						 } else {
						   sendReply ( o.fn(msg.data, e) );
						 }
					 }
					 catch (ex) {
						 if (msg.errback) {
							 // notify post message errback
							 pm.send({target:e.source, data:ex, type:msg.errback});
						 } else {
							 throw ex;
						 }
					 }
				 };
			 }
		 }
	 };
	 // location hash polling
	 pm.hash = {
		 send: function(options, msg) {
			 //console.log("hash.send", target_window, options, msg);
			 var target_window = options.target,
			 target_url = options.url;
			 if (!target_url) {
				 console.warn("postmessage target window url is required");
				 return;
			 }
			 target_url = pm.hash._url(target_url);
			 var source_window,
			 source_url = pm.hash._url(window.location.href);
			 if (window == target_window.parent) {
				 source_window = "parent";
			 }
			 else {
				 try {
					 for (var i=0,len=parent.frames.length; i<len; i++) {
						 var f = parent.frames[i];
						 if (f == window) {
							 source_window = i;
							 break;
						 }
					 };
				 }
				 catch(ex) {
					 // Opera: security error trying to access parent.frames x-origin
					 // juse use window.name
					 source_window = window.name;
				 }
			 }
			 if (source_window == null) {
				 console.warn("postmessage windows must be direct parent/child windows and the child must be available through the parent window.frames list");
				 return;
			 }
			 var hashmessage = {
				 "x-requested-with": "postmessage",
				 source: {
					 name: source_window,
					 url: source_url
				 },
				 postmessage: msg
			 };
			 var hash_id = "#x-postmessage-id=" + pm._random();
			 target_window.location = target_url + hash_id + encodeURIComponent(JSON.stringify(hashmessage));
		 },
		 _regex: /^\#x\-postmessage\-id\=(\w{32})/,
		 _regex_len: "#x-postmessage-id=".length + 32,
		 _bind: function() {
			 // are we already listening to message events on this w?
			 if (!pm.data("polling.postmessage")) {
				 setInterval(function() {
								 var hash = "" + window.location.hash,
								 m = pm.hash._regex.exec(hash);
								 if (m) {
									 var id = m[1];
									 if (pm.hash._last !== id) {
										 pm.hash._last = id;
										 pm.hash._dispatch(hash.substring(pm.hash._regex_len));
									 }
								 }
							 }, $.pm.poll || 200);
				 pm.data("polling.postmessage", 1);
			 }
		 },
		 _dispatch: function(hash) {
			 if (!hash) {
				 return;
			 }
			 try {
				 hash = JSON.parse(decodeURIComponent(hash));
				 if (!(hash['x-requested-with'] === 'postmessage' &&
					   hash.source && hash.source.name != null && hash.source.url && hash.postmessage)) {
					 // ignore since hash could've come from somewhere else
					 return;
				 }
			 }
			 catch (ex) {
				 // ignore since hash could've come from somewhere else
				 return;
			 }
			 var msg = hash.postmessage,
			 cbs = pm.data("callbacks.postmessage") || {},
			 cb = cbs[msg.type];
			 if (cb) {
				 cb(msg.data);
			 }
			 else {
				 var source_window;
				 if (hash.source.name === "parent") {
					 source_window = window.parent;
				 }
				 else {
					 source_window = window.frames[hash.source.name];
				 }
				 var l = pm.data("listeners.postmessage") || {};
				 var fns = l[msg.type] || [];
				 for (var i=0,len=fns.length; i<len; i++) {
					 var o = fns[i];
					 if (o.origin) {
						 var origin = /https?\:\/\/[^\/]*/.exec(hash.source.url)[0];
						 if (o.origin !== '*' && origin !== o.origin) {
							 console.warn("postmessage message origin mismatch", origin, o.origin);
							 if (msg.errback) {
								 // notify post message errback
								 var error = {
									 message: "postmessage origin mismatch",
									 origin: [origin, o.origin]
								 };
								 pm.send({target:source_window, data:error, type:msg.errback, hash:true, url:hash.source.url});
							 }
							 continue;
						 }
					 }
					 function sendReply ( data ) {
					   if (msg.callback) {
						 pm.send({target:source_window, data:data, type:msg.callback, hash:true, url:hash.source.url});
					   }
					 }
					 try {
						 if ( o.callback ) {
						   o.fn(msg.data, sendReply);
						 } else {
						   sendReply ( o.fn(msg.data) );
						 }
					 }
					 catch (ex) {
						 if (msg.errback) {
							 // notify post message errback
							 pm.send({target:source_window, data:ex, type:msg.errback, hash:true, url:hash.source.url});
						 } else {
							 throw ex;
						 }
					 }
				 };
			 }
		 },
		 _url: function(url) {
			 // url minus hash part
			 return (""+url).replace(/#.*$/, "");
		 }
	 };
	 $.extend(pm, {
				  defaults: {
					  target: null,  /* target window (required) */
					  url: null,     /* target window url (required if no window.postMessage or hash == true) */
					  type: null,    /* message type (required) */
					  data: null,    /* message data (required) */
					  success: null, /* success callback (optional) */
					  error: null,   /* error callback (optional) */
					  origin: "*",   /* postmessage origin (optional) */
					  hash: false    /* use location hash for message passing (optional) */
				  }
			  });
})(this, typeof jQuery === "undefined" ? NO_JQUERY : jQuery);

(function($) {
	"use strict";
	$.socleBureau = {};
	var conn,
		messagePending         = "",
		messagePendingInterval = 5000,
		messagePendingTimer,
		ActionEnum = {},
		listCallBacks = {},
		listeCallBackInit = [];
	$.socleBureau.paramTech = $.Deferred();
	function ajoutCallBack(typeAction, action, callBack) {
		listCallBacks[action] = listCallBacks[action] || {};
		listCallBacks[action][typeAction] = listCallBacks[action][typeAction] || [];
		// on ajoute la callBack au tableau dans la liste des methodes a appeler sur un retour specifique
		listCallBacks[action][typeAction].push(callBack);
	}
	// id du socle
	$.socleBureau.getNameIdSocle = function () {
		return "IDLC";
	};
	/* Methode d'initialisation de la connexion (signalR) */
	$.socleBureau.init = function() {
		conn = $.connection("http://localhost:8081/signalrmaaf");
	};
	/*  - Status : OK
		Events SignalR MAAF
		$($.socleBureau.getConnecteur()).on($.socleBureau.Events.waitForPendingMessage, function(event, etat)
		$($.socleBureau.getConnecteur()).on($.socleBureau.Events.errors, function(event, error)
	*/
	$.socleBureau.Events = { "waitForPendingMessage":"WaitForPendingMessage",
							 "errors":"OnErrors"};
	/*  - Status : OK
		Parametres utilise par le client pour communiquer avec le socle.
	*/
	$.socleBureau.ParamsEnum = { "nomFichier":"NomFic",
								 "enabled":"Enabled",
								 "nomEvenement":"NomEvt",
								 "contexte":"Contexte",
								 "applicationCible":"AppliCible",
								 "typeTraitement":"TypeTraitement",
								 "situation":"Situation",
								 "indicateurRegroupement":"IndicateurRegroupement",
								 "acquittementSocle":"AcquittementSocle" };
	/*  - Status : OK
		Enum des actions possibles pour le traitement groupe.
	*/
	$.socleBureau.TraitementGroupeEnum = { "ferme":"Ferme",
										   "minimise":"Minimise",
										   "restaure":"Restaure",
										   "cache":"Cache",
										   "affiche":"Affiche",
										   "miseEnAvantPlan":"MiseEnAvantPlan" };
	/*  - Status : OK
		Enumeration des interactions possibles avec le socle
	*/
	ActionEnum = {"lancementAppli":"LancementAppli",
						"notifFermeture":"NotifFermeture",
						"notifNonFermeture":"NotifNonFermeture",
						"demandeFocus":"DemandeFocus",
						"appelEvt":"AppelEvt",
						"abonnementEvt":"AbonnementEvt",
						"desabonnementEvt":"DesabonnementEvt",
						"visualisation":"Visualisation",
						"impression":"Impression",
						"tentFermeture":"TentFermeture",
						"blocageAppli":"BlocageAppli",
						"deblocageAppli":"DeblocageAppli",
						"erreurServeur":"ErreurServeur",
						"rattachement":"Rattachement",
						"traitementGroupe":"TraitementGroupe",
						"acquittement":"Acquittement",
						"debugSocle":"DebugSocle",
						"remasquage":"Remasquage",
						"ouvreMetier":"OuvreMetier",
						"getParametrePartage":"GetParametrePartage",
						"setParametrePartage":"SetParametrePartage",
						"initialisation":"Initialisation",
						"getParamsPosteMaaf":"GetParamsPosteMaaf",
						"none":"None" };
	/*  - Status : OK
	*/
	$.socleBureau.connectionStateEnum = {
		connecting: 0,
		connected: 1,
		reconnecting: 2,
		disconnected: 4
	};
	/*  - Status : OK
		Getter connecteur ( ecoute des Events ).
	*/
	$.socleBureau.getConnecteur = function(){
		return conn;
	};
	/*  - Status : OK
		Methode privee de creation de l envellope XML
		action : Visualisation, Impression, ...
		paramsTech : {nom1 : valeur1, nom2 : valeur2 ...}
		paramsFonc : {nom1 : valeur1, nom2 : valeur2 ...}
	*/
	function enveloppeXml(action, paramsTech, paramsFonc) {
		var param = null,
			retourTech = "",
			retourFonc = "";
		for(param in paramsTech) {
			if(paramsTech.hasOwnProperty(param)) {
				retourTech += '<param><nom>' + param + '</nom><valeur>' + paramsTech[param] + '</valeur></param>';
			}
		}
		retourTech = '<paramsTech>' + retourTech + '</paramsTech>';
		for(param in paramsFonc) {
			if(paramsFonc.hasOwnProperty(param)) {
				retourFonc += '<param><nom>' + param + '</nom><valeur>' + paramsFonc[param] + '</valeur></param>';
			}
		}
		retourFonc = '<paramsFonc>' + retourFonc + '</paramsFonc>';
		return '<?xml version="1.0" encoding="utf-16"?><fluxsocle xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><action nom="' + action + '">' + retourTech + retourFonc + '</action></fluxsocle>';
	}
	/*  - Status : Ok
		Annule le blocage des communications
	*/
	function releaseWaitMessagePending(){
		messagePending = "";
		clearInterval(messagePendingTimer);
		$(conn).trigger($.socleBureau.Events.waitForPendingMessage, false);
	}
	/*
	 * creation de la structure permettant de recevoir des datas provenant du connecteur et d'appeler les fonctions callbacks enregistrees (voir addCallBacks)
	 */
	function prepareReception() {
		conn.received(function (data) {
			var response = {},
				i,
				action,
				typeAction;
			//console.log("prepareReception : " + data);
			data = $($.parseXML(String(data)));
			response.action = data.find('action').attr('nom');
			response.paramTech = {};
			response.paramFonc = {};
			// recuperation des params tech
			$.each(data.find('paramsTech > param'), function(i, item) {
				var $item=$(item);
				response.paramTech[$item.find('nom').text()] = $item.find('valeur').text();
			});
			// recuperation des params fonc
			$.each(data.find('paramsFonc > param'), function(i, item) {
				var $item=$(item);
				response.paramFonc[$item.find('nom').text()] = $item.find('valeur').text();
			});
			//console.log("prepareReception " + response.action + " " + response.paramTech.typeAction);
			// unlock event si acquittementSocle
			if(messagePending === response.paramTech.typeAction) {
				releaseWaitMessagePending();
			}
			action = response.action;
			if (action === ActionEnum.acquittement && ActionEnum.initialisation ===response.paramTech.typeAction) {
	// envoie de la demande de paramsPosteMaaf
				//console.log("prepareReception acq init => getPPM");
	$.socleBureau.getParamsPosteMaaf().onAck(function(data) {
	//console.log("prepareReception getPPM acq");
	var i;
	$.socleBureau.paramTech.resolve(data.paramTech);
	for (i = 0; i < listeCallBackInit.length; i+=1) {
	listeCallBackInit[i](data.paramTech);
	}
	});
			}
			if (action === ActionEnum.appelEvt) {
				typeAction = response.paramTech.NomEvt;
			} else {
				typeAction = response.paramTech.typeAction;
			}
			if(listCallBacks[action] && listCallBacks[action][typeAction]) {
				if (action === ActionEnum.appelEvt) {
					// dans le cas d'un abonnement, on garde la callBack
					for(i=0; i< listCallBacks[action][typeAction].length; i+=1) {
						listCallBacks[action][typeAction][i](response);
					}
				} else {
					// sinon on envele la callBack qui est à usage unique
					for(i=0; i< listCallBacks[action][typeAction].length; i+=1) {
						listCallBacks[action][typeAction].pop()(response);
					}
				}
			}
		});
	}
	/*  - Status : OK
	*/
	function initialisation(ident_socle) {
		var message = enveloppeXml( ActionEnum.initialisation,
								   {
									 "init":"true",
									 "ident_socle": ident_socle,
									 "ident_signalr": conn.id,
									 "AcquittementSocle":"1"
								   }
								  );
		//console.log("send initialisation");
		return sendMessage(ActionEnum.initialisation, 1, message);
	}
	/*  - Status : Ok
		Demarrage de la connexion SignalR
	*/
   $.socleBureau.start = function(idsocle) {
		/*  - Status : Ok
			Handler errors
		*/
		conn.error(function (error) {
			if(error) {
				$(conn).trigger($.socleBureau.Events.errors, error);
				//console.log("erreur signalR : " + error);
				throw "Erreur de connexion au socle bureau";
			}
		});
		return conn.start()
			.done(function () {
				// preparation des messages en reception
				prepareReception();
				// initialisation de la connexion
				initialisation(idsocle);
			})
			.fail(function(){
				$(conn).trigger($.socleBureau.Events.errors, "Could not Connect Server SignalR");
			});
   };
	/*  - Status : OK
		Methode publique de Fermeture de la connexion SignalR
	*/
	$.socleBureau.stop = function() {
		conn.stop();
	};
	/*  - Status : Ok
		Private methode Send message to server.
	*/
	function sendMessage(typeAction, acquittementSocle, message, event){
		var socleConn = null;
		event = event || '';
		if(messagePending) {
			return false;
		}
		acquittementSocle = parseInt(acquittementSocle, 10);
		if(acquittementSocle) {
			messagePending = typeAction;
			messagePendingTimer = setInterval(function(){
				releaseWaitMessagePending();
			}, messagePendingInterval);
			$(conn).trigger($.socleBureau.Events.waitForPendingMessage, true);
		}
		try {
			socleConn = conn;
			// ajout  d'une fonction de callBack pour l'acquittement
			socleConn.onAck = function(callBack) {
				if (callBack) {
				ajoutCallBack(typeAction, ActionEnum.acquittement, callBack);
				}
				return socleConn;
			};
			// ajout d'une fonction done pour la reception de message dans le cas d'abonnement
			if (typeAction === ActionEnum.abonnementEvt) {
				socleConn.onReceiveEvent = function(callBack) {
					if (callBack) {
					ajoutCallBack(event, ActionEnum.appelEvt, callBack);
					}
					return socleConn;
				};
			}
			return socleConn.send(message);
		} catch (error){
			$(conn).trigger($.socleBureau.Events.errors, error);
			return null;
		}
	}
	// --------------------------------------------------------------------
	// Exposition au client des fonctions d'interaction avec le socle  ----
	// --------------------------------------------------------------------
	/*  - Status : Dvlp
		Methode publique de recuperation des parametres du poste Maaf
	*/
	$.socleBureau.getParamsPosteMaaf = function() {
		var msg = {},
			message;
		msg.AcquittementSocle = "1";
		message = enveloppeXml(ActionEnum.getParamsPosteMaaf, msg);
		return sendMessage(ActionEnum.getParamsPosteMaaf, msg.AcquittementSocle, message);
	};
	/*  - Status : OK
		Methode publique de visualisation de document
	*/
	$.socleBureau.visualisationDocument = function(msg) {
		msg.AcquittementSocle = "1";
		var message = enveloppeXml(ActionEnum.visualisation, msg);
		return sendMessage(ActionEnum.visualisation, msg.AcquittementSocle, message);
	};
	/*  - Status : OK
		Methode publique d'Impression de document
		msg = {"NomFic" : ""}
	*/
	$.socleBureau.impressionDocument = function(msg) {
		msg.AcquittementSocle = "0";
		var message = enveloppeXml(ActionEnum.impression, msg);
		return sendMessage(ActionEnum.impression, msg.AcquittementSocle, message);
	};
	/*  - Status : Ok
		Methode publique d ajout de parametres partages
		paramsFonc : {nom1 : valeur1, nom2 : valeur2, ...}
	*/
	var setParametresPartages = function(paramsFonc) {
		var msg = {},
			message;
		msg.AcquittementSocle = "1";
		message = enveloppeXml(ActionEnum.setParametrePartage,
								   msg,
								   paramsFonc);
		return sendMessage(ActionEnum.setParametrePartage, msg.AcquittementSocle, message);
	};
	/*  - Status : Ok
		Methode publique de recuperation de parametres partages
		paramsFonc : {nom1 : '', nom2 : '', ...}
	*/
	var getParametresPartages = function(paramsFonc) {
		var msg = {},
			message;
		msg.AcquittementSocle = "1";
		message = enveloppeXml(ActionEnum.getParametrePartage,
								   msg,
								   paramsFonc);
		return sendMessage(ActionEnum.getParametrePartage, msg.AcquittementSocle, message);
	};
	/*  - Status : Ok
		Methode publique d abonnement a un evenement
		msg = { "NomEvt" : "...", "AcquittementSocle" : "[0|1]"}
	*/
	$.socleBureau.abonnementEvenement = function(msg) {
		msg.AcquittementSocle = msg.AcquittementSocle || 0;
		var message = enveloppeXml(ActionEnum.abonnementEvt, msg);
		return sendMessage(ActionEnum.abonnementEvt, msg.AcquittementSocle, message, msg.NomEvt);
	};
	/*  - Status : Ok
		Methode publique de desabonnement a un evenement
		msg = { "NomEvt" : "...", "AcquittementSocle" : "[0|1]"}
	*/
	$.socleBureau.desabonnementEvenement = function(msg) {
		var action = ActionEnum.appelEvt, typeAction = msg.NomEvt;
		listCallBacks[action][typeAction] = [];
		msg.AcquittementSocle = msg.AcquittementSocle || 0;
		var message = enveloppeXml(ActionEnum.desabonnementEvt, msg);
		return sendMessage(ActionEnum.desabonnementEvt, msg.AcquittementSocle, message);
	};
	/*  - Status : Ok
		Methode publique d appel d un evenement
		msg = { "NomEvt" : "...", "Contexte" : "..." ,"AcquittementSocle" : "[0|1]"}
		paramsFonc : {nom1 : valeur1, nom2 : valeur2, ...}
	*/
	$.socleBureau.appelEvenement = function(msg, paramsFonc) {
		msg.AcquittementSocle = msg.AcquittementSocle || 0;
		var message = enveloppeXml(ActionEnum.appelEvt, msg, paramsFonc);
		return sendMessage(ActionEnum.appelEvt, msg.AcquittementSocle, message);
	};
	/*  - Status : Ok
		Methode publique de Lancement d application
		msg = { "applicationCible" : "...", "indicateurRegroupement" : "..." ,"AcquittementSocle" : "[0|1]"}
		paramsFonc : {nom1 : valeur1, nom2 : valeur2, ...}
	*/
	$.socleBureau.lancementApplication = function(msg, paramsFonc) {
		msg.AcquittementSocle = msg.AcquittementSocle || 0;
		msg.Acquittement = "0";
		var message = enveloppeXml(ActionEnum.lancementAppli, msg, paramsFonc);
		return sendMessage(ActionEnum.lancementAppli, msg.AcquittementSocle, message);
	};
	/*  - Status : Dvlp
		Methode publique de Traitement Groupe
		msg = { "contexte" : "..." , "typeTraitement" : "..." , "AcquittementSocle" : "[0|1]"}
		paramsFonc : {nom1 : valeur1, nom2 : valeur2, ...}
	*/
	$.socleBureau.traitementGroupe = function(msg, paramsFonc) {
		msg.AcquittementSocle = msg.AcquittementSocle || 0;
		msg.applicationCible = "";
		var message = enveloppeXml(ActionEnum.traitementGroupe, msg, paramsFonc);
		return sendMessage(ActionEnum.traitementGroupe, msg.AcquittementSocle, message);
	};
	$.socleBureau.setIdentifiantSessionEditique = function(idSessionEditique) {
		return setParametresPartages({"idSessionEditique":idSessionEditique});
	};
	$.socleBureau.ouvreMetier = function (paramTech, paramFonc) {
		paramTech.AcquittementSocle = paramTech.AcquittementSocle || 0;
		var message = enveloppeXml(ActionEnum.ouvreMetier, paramTech, paramFonc);
		return sendMessage(ActionEnum.ouvreMetier, paramTech.AcquittementSocle, message);
	};
	$.socleBureau.getIdentifiantSessionEditique = function() {
		return getParametresPartages({"idSessionEditique":""});
	};
	/*  - Status : OK
		Retourne 0/1 en fonction du status de la connection
	*/
	$.socleBureau.IsConnexionLoaded = function(){
		return conn && conn.state === $.socleBureau.connectionStateEnum.connected;
	};
	/*  - Status : OK
		Retourne le status de la connection
	*/
	$.socleBureau.Status = function(){
		return conn.state;
	};
	$.socleBureau.onSocleReady = function (handler) {
	listeCallBackInit.push(handler);
	};
}(jQuery));

(function($) {
	"use strict";
	/*  - Status :
	recupere l id_socle dans le cookie ou un /rand si lance en autonome.
	*/
	function getIdSocle() {
		// Seek via cookie params :
		var name = $.socleBureau.getNameIdSocle();
		return $.cookie(name) || $.urlParam(name);
		// TODO Implementation du POST
		// Seek via Post data
		// not yet implemented ...
	}
	// tentative de connexion automatique au socle bureau au demarrage du framework
	$(function() {
	var idSocle = getIdSocle();
	if (idSocle) {
	//console.log("sbe id " + idSocle);
	$.socleBureau.init();
	$.socleBureau.start(idSocle).fail(function() {
	//console.log("ko socle bureau");
	});
	} else {
	// si le socle bureau n'est pas présent
	//console.log("no sbe");
	$.socleBureau.paramTech.resolve(null);
	}
	});
}(jQuery));

(function($, jsam) {
	"use strict";
	var listCallBackHandlers = [],
	authUser = {}, X_SESSIONID="x-sessionid";
	// récupération du sessionId
	function provideSessionId(jqXhr){
		if(jqXhr && jqXhr.getResponseHeader && window.jsam && (window.jsam.sessionId === "") && jqXhr.getResponseHeader(X_SESSIONID)){
			window.jsam.sessionId = jqXhr.getResponseHeader(X_SESSIONID);
		}
	}
	// fonction de verification de l'authentification
	function login(user, pwd, pDefSubject) {
	var defSubject = pDefSubject || $.Deferred(),
	authUser;
	$.ajax({
		'url': 'services/users/login',
		'beforeSend': function(xhr) {
	//May need to use "Authorization" instead
	var authorization = $.base64.encode(user + ":" + pwd);
	window.jsam.authentication.authorization = authorization;
	xhr.setRequestHeader("Authorization", "Basic " + authorization);
	if(window.jsam.sessionId !== ""){
		xhr.setRequestHeader(X_SESSIONID, window.jsam.sessionId);
	}
		},
		success: function(data, textStatus, jqXHR) {
	authUser = {
	identity : {
	user : data.name,
	pwd : pwd
	},
	roles : data.roles,
	niveauDP : data.niveauDP||0,
	societe : data.societe,
	entite : data.entite,
	isUserInRole : function(role) {
	return data.roles && ("|"+data.roles.join("|")+"|").indexOf("|" + role + "|") > -1;
	},
	isAuthorizedForDP : function(niveauDP){
	return data.niveauDP||0 >= niveauDP||0;
	}
	};
	provideSessionId(jqXHR);
	defSubject.resolve(authUser);
		}
	}).statusCode({
	401: function() {
	defSubject.reject(401);
	},
	403: function() {
	defSubject.reject(403);
	}
	}).fail(function(jqXHR){
		provideSessionId(jqXHR);
	});
	return defSubject;
	}
	function callBackOk(pAuthUser) {
	window.jsam.authentication.authUser = pAuthUser;
	$("body").trigger("authenticated");
	}
	function callBackKo(erreur) {
	//subject.fail(erreur);
	}
	function init() {
	if(listCallBackHandlers.length) {
	(function loop() {
	(listCallBackHandlers.shift())(login).done(callBackOk).fail(listCallBackHandlers.length ? loop : callBackKo);
	}());
	}
	}
	// exports
	window.jsam = window.jsam || {};
	window.jsam.authentication = {
	init : init,
	listCallBackHandlers : listCallBackHandlers,
	authUser : authUser,
	authorization : ""
	};
	window.jsam.sessionId = "";
}(jQuery, window));

(function($, listCallBackHandlers) {
	"use strict";
	// authentification par QueryString user / mdp
	var authentication = $("body").data("authentication");
	if (authentication && authentication.indexOf("QueryString") > -1) {
	listCallBackHandlers.push(function(login) {
	var defSubject = $.Deferred(),
	id = $.urlParam("user"),
	pwd = $.urlParam("pwd");
	if (id && pwd) {
	login(id, pwd, defSubject);
	} else {
	defSubject.reject("no credentials QueryString");
	}
	return defSubject;
	});
	}
}(jQuery, jsam.authentication.listCallBackHandlers));

(function($, listCallBackHandlers) {
	"use strict";
	// authentification par socle bureau
	var authentication = $("body").data("authentication");
	if (authentication && authentication.indexOf("SocleBureau") > -1) {
	//console.log("authen add callback sbe");
	listCallBackHandlers.push(function(login) {
	var defSubject = $.Deferred(),
	id, pwd;
	//console.log("authen sbe");
	$.socleBureau.paramTech.done(function(paramTech) {
	//console.log("authen sbe gppm done");
	if (paramTech) {
	id = paramTech.U;
	pwd = paramTech.P;
	//console.log("authen sbe login");
	login(id, pwd, defSubject);
	} else {
	//console.log("no credentials Socle Bureau");
	// si la connexion au socle bureau a echoue
	defSubject.reject("no credentials Socle Bureau");
	}
	}).fail(function() {
	// dans ce cas, le paramTech n'a pas pu etre trouve, pas de connexion socle
	//console.log("authent sbe fail");
	});
	return defSubject;
	});
	}
}(jQuery, jsam.authentication.listCallBackHandlers));

(function($, listCallBackHandlers) {
	"use strict";
	// authentification par mire de login
	var authentication = $("body").data("authentication");
	if (authentication && authentication.indexOf("MireLogin") > -1) {
	listCallBackHandlers.push(function(login) {
	var defSubject = $.Deferred(),
	cache = $("<div/>").appendTo("body").css({
	"position" : "absolute",
	"left" : 0,
	"top" : 0,
	"z-index" : "9000",
	"background-color" : "#121212",
	"opacity" : "0.75"
	}),
			formulaire = $('<form class="form-horizontal"></form>').appendTo(cache);
			formulaire.append($('<div class="control-group"><label class="control-label" for="inputId">User</label><div class="controls"><input type="text" id="inputId" placeholder="Identifiant"></div></div>'));
			formulaire.append($('<div class="control-group"><label class="control-label" for="inputPassword">Password</label><div class="controls"><input type="password" id="inputPassword" placeholder="mot de passe"></div></div>'));
			formulaire.append($('<div class="control-group"><div class="controls"><button type="submit" class="btn">Valider</button></div></div>'));
			formulaire.append($('<span id="errorInfo"></span>'));
			function resizeCache() {
	cache.width($(window).width())
	.height($(window).height());
	formulaire.css({
	"left" : $(window).width() / 2 - 300,
	"top" : $(window).height() / 5,
	"position" : "relative",
	"width" : "500px",
	"background-color" : "#000000"
	});
	}
			// on execute le redimentionnement
			resizeCache();
			// on prend en compte le redimentionnement de l'ecran
			$(window).bind("resize", resizeCache);
			formulaire.on("submit", function (e) {
	var id, pwd;
	e.preventDefault();
	id = $("#inputId").val();
	pwd = $("#inputPassword").val();
	login(id, pwd).done(function(subject) {
	// on enleve la mire
	cache.remove();
	// on enleve le bind de redimentionnement sur le body
	$(window).unbind("resize", resizeCache);
	defSubject.resolve(subject);
	}).fail(function(error) {
	$("#errorInfo").text("Erreur d'authentification");});
	});
	return defSubject;
	});
	}
}(jQuery, jsam.authentication.listCallBackHandlers));

$(function() {
	var authentication = $("body").data("authentication");
	if (authentication) {
	jsam.authentication.init();
	}
});

(function($) {
	"use strict";
	// si la variable window.supervision n'est pas définie alors on ne traitera pas les performances sur l'application
	var supervision = window.supervision, notifyMessages = [], infoPoste = null, moduleActif = !!window.supervision, X_SESSIONID="x-sessionid", authentication = !!$("body").data("authentication"), socleBureauAuth = authentication && ($("body").data("authentication").indexOf("SocleBureau") !== -1);
	/**
	 * Envoi les données statistique à la supervision
	 */
	function notify() {
	// si la pile est vide ou si les infos du poste ne sont pas récupérés on n'envoit pas les stats
		if(!notifyMessages || !infoPoste || !notifyMessages.length) {
	return;
	}
	var rqMsg = infoPoste;
	rqMsg.messages = notifyMessages;
	// si on dispose du sessionId, on le passe dans le header
	function beforeSend(xhr, settings) {
		var sessionId = window.jsam.sessionId;
		if(sessionId){
				xhr.setRequestHeader(X_SESSIONID, sessionId);
			}
		// si on dispose de l'authentification on passe l'information
		if (window.jsam && window.jsam.authentication) {
				var authorization = window.jsam.authentication.authorization;
				if (authorization) {
					xhr.setRequestHeader("Authorization", "Basic " + authorization);
				}
			}
	}
	// récupération du sessionId
		function provideSessionId(jqXhr){
			if(jqXhr && jqXhr.getResponseHeader && window.jsam && (window.jsam.sessionId === "") && jqXhr.getResponseHeader(X_SESSIONID)){
				window.jsam.sessionId = jqXhr.getResponseHeader(X_SESSIONID);
			}
		}
	notifyMessages = [];
	$.ajax({
	type : "POST",
	url : "services/supervision",
	contentType : "application/vnd.maaf.monitoring.supervision+json",
	beforeSend : beforeSend,
	dataType : "json",
	data : JSON.stringify(rqMsg)
	}).done(function(data, textStatus, jqXHR) {
		provideSessionId(jqXHR);
		}).fail(function(jqXHR, textStatus, errorThrown) {
			provideSessionId(jqXHR);
		});
	}
	/**
	 * Empile la donnée statistique pour la supervision
	 */
	function addNotifyMessage(loadTime, identifiant, categorie, ref) {
	notifyMessages.push({
	temps : loadTime,
	identifiant : identifiant,
	categorie : categorie,
	ref : ref
	});
	}
	/**
	 * Récupère le nom de l'écran
	 */
	function filterEcran(ecran) {
		return !ecran ? "" : ecran;
	}
	/**
	 * Récupère le nom du service services/NomDuService/param1/...
	 */
	function filterService(service) {
		var tab = service.split("/");
		return tab.length >= 2 ? tab[1] : tab.join("");
	}
	/**
	 * Ajoute si nécessaire la date de fin de chargement de l'écran et envoie les infos à la supervision
	 * On ferme la capture lorsque tous les appels AJAX ayant commencés après la début de la capture sont terminés (pile vide)
	 */
	function fermerCaptureAppelsAjax() {
	// si on ne capture pas, on envoie les infos statistique
	if(!supervision.capture.enCours) {
	notify();
	return;
	}
	// si la pile n'est pas vide ou que l'on ne souhaite pas arreter la capture, alors on ne fait rien
	if(Object.keys(supervision.pileAppelsAjax).length !== 0 || !supervision.capture.arreterCapture) {
	return;
	}
	// on fait quelque chose, si la pile est VIDE et si l'on souhaite ARRETER la capture
	if(supervision.capture.identifiant && supervision.capture.start) { // on ajoute le temps de chargement de l'écran
	addNotifyMessage((new Date()).getTime() - supervision.capture.start, supervision.capture.identifiant, "N", "");
	}
	notify();
	supervision.capture.enCours = false;
	supervision.capture.identifiant = "";
	supervision.capture.arreterCapture = false;
	}
	/**
	 * Démarre la capture des appels ajax nécessaire à l'affichage de l'écran
	 */
	function demarrerCatureAppelsAjax(identifiant) {
	supervision.capture = {
	start : (new Date()).getTime(),
	identifiant : identifiant,
	enCours : true,
	arreterCapture : false
	};
	}
	/**
	 * Enregistre la callback qui va notifier si nécessaire sur l'événement authenticated
	 */
	function registerAuthCallback(){
		$("body").on("authenticated", function() {
			infoPoste = {};
			fermerCaptureAppelsAjax();
		});
	}
	/**
	 * A la fin du chargement de la page + ressources (images, js, css, ...)
	 * L'écran est chargé sauf s'il y a des appels ajax en cours
	 */
	$(window).load(function() {
	if(!moduleActif) {
	return;
	}
	supervision.capture.arreterCapture = true; // on stop la capture
	fermerCaptureAppelsAjax();
	});
	$(function(){
	if(!moduleActif) {
	return;
	}
	// on complète les informations de la capture courante (écran d'accueil)
	supervision.capture.identifiant = filterEcran($(".conteneur").find(".actif").attr("id"));
	if(authentication){
			if(socleBureauAuth){
				if($.socleBureau && $.socleBureau.hasOwnProperty("paramTech")) {
					$.socleBureau.paramTech.done(function(paramTech){
						if(paramTech) { // auth socle bureau OK
							infoPoste = {
								modeConnexion : paramTech.TYPECON,
								codeSoc : paramTech.NENT,
								poste : paramTech.NOMSTAT,
								site : paramTech.TYPESITE
							};
							fermerCaptureAppelsAjax();
						} else { // au socle bureau KO (fail)
							registerAuthCallback();
						}
					}).fail(function(){
						registerAuthCallback();
					});
				} else {
					fermerCaptureAppelsAjax();
				}
			} else { // authentification non socle bureau
				registerAuthCallback();
			}
		} else {
			infoPoste = {};
		}
	/**
	 * On écoute les appels REST afin de calculer le temps de chaque service
	 */
	$("body").on("beforesend.rest", function(event, methode, url) {
			supervision.pileAppelsAjax[url] = {
				start : (new Date()).getTime(), // on empile le service
				identifiant : filterService(url),
				ref : supervision.capture.identifiant
			};
		});
		$("body").on("response.rest", function(event, methode, url) {
			var requestAjax = supervision.pileAppelsAjax[url];
			// si on ne trouve pas la date du début de l'appel c'est qu'on l'a lancé plusieurs fois
			if(!requestAjax) {
				return;
			}
			delete supervision.pileAppelsAjax[url]; // on dépile le service
			// si on a pas changé d'écran entre temps alors le service est associé sinon il est isolé
			addNotifyMessage((new Date()).getTime() - requestAjax.start, requestAjax.identifiant, supervision.capture.enCours && supervision.capture.identifiant===requestAjax.ref? "SA" : "SI", supervision.capture.identifiant===requestAjax.ref ? supervision.capture.identifiant : ""); // temps d'exécution du service
			fermerCaptureAppelsAjax(); // envoie les infos si nécessaire
		});
	$(".conteneur").on("show.conteneur", function(e) {
			if(e.namespace) {
				if(supervision.capture.enCours){
					// si on est déjà en train d'enregistrer le temps d'affichage d'un écran
					addNotifyMessage((new Date()).getTime() - supervision.capture.start, supervision.capture.identifiant, "N", "");
					supervision.capture.identifiant = filterEcran(e.ecran);
				} else {
					demarrerCatureAppelsAjax(filterEcran(e.ecran));
				}
			}
		});
	$(".conteneur").on( "shown.conteneur", function(e) {
	if(e.namespace) {
	supervision.capture.arreterCapture = true; // on stop la capture
	fermerCaptureAppelsAjax(); // envoie les infos si nécessaire
	}
	});
	});
}(jQuery));

/*jslint adsafe: false, bitwise: true, browser: true, cap: false, css: false,
  debug: false, devel: true, eqeqeq: true, es5: false, evil: false,
  forin: false, fragment: false, immed: true, laxbreak: false, newcap: true,
  nomen: false, on: false, onevar: true, passfail: false, plusplus: true,
  regexp: false, rhino: true, safe: false, strict: false, sub: false,
  undef: true, white: false, widget: false, windows: false */
/*global jQuery: false, window: false */
"use strict";
/*
 * Original code (c) 2010 Nick Galbreath
 * http://code.google.com/p/stringencoders/source/browse/#svn/trunk/javascript
 *
 * jQuery port (c) 2010 Carlo Zottmann
 * http://github.com/carlo/jquery-base64
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
*/
/* base64 encode/decode compatible with window.btoa/atob
 *
 * window.atob/btoa is a Firefox extension to convert binary data (the "b")
 * to base64 (ascii, the "a").
 *
 * It is also found in Safari and Chrome.  It is not available in IE.
 *
 * if (!window.btoa) window.btoa = $.base64.encode
 * if (!window.atob) window.atob = $.base64.decode
 *
 * The original spec's for atob/btoa are a bit lacking
 * https://developer.mozilla.org/en/DOM/window.atob
 * https://developer.mozilla.org/en/DOM/window.btoa
 *
 * window.btoa and $.base64.encode takes a string where charCodeAt is [0,255]
 * If any character is not [0,255], then an exception is thrown.
 *
 * window.atob and $.base64.decode take a base64-encoded string
 * If the input length is not a multiple of 4, or contains invalid characters
 *   then an exception is thrown.
 */
jQuery.base64 = ( function( $ ) {
  var _PADCHAR = "=",
	_ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
	_VERSION = "1.0";
  function _getbyte64( s, i ) {
	// This is oddly fast, except on Chrome/V8.
	// Minimal or no improvement in performance by using a
	// object with properties mapping chars to value (eg. 'A': 0)
	var idx = _ALPHA.indexOf( s.charAt( i ) );
	if ( idx === -1 ) {
	  throw "Cannot decode base64";
	}
	return idx;
  }
  function _decode( s ) {
	var pads = 0,
	  i,
	  b10,
	  imax = s.length,
	  x = [];
	s = String( s );
	if ( imax === 0 ) {
	  return s;
	}
	if ( imax % 4 !== 0 ) {
	  throw "Cannot decode base64";
	}
	if ( s.charAt( imax - 1 ) === _PADCHAR ) {
	  pads = 1;
	  if ( s.charAt( imax - 2 ) === _PADCHAR ) {
		pads = 2;
	  }
	  // either way, we want to ignore this last block
	  imax -= 4;
	}
	for ( i = 0; i < imax; i += 4 ) {
	  b10 = ( _getbyte64( s, i ) << 18 ) | ( _getbyte64( s, i + 1 ) << 12 ) | ( _getbyte64( s, i + 2 ) << 6 ) | _getbyte64( s, i + 3 );
	  x.push( String.fromCharCode( b10 >> 16, ( b10 >> 8 ) & 0xff, b10 & 0xff ) );
	}
	switch ( pads ) {
	  case 1:
		b10 = ( _getbyte64( s, i ) << 18 ) | ( _getbyte64( s, i + 1 ) << 12 ) | ( _getbyte64( s, i + 2 ) << 6 );
		x.push( String.fromCharCode( b10 >> 16, ( b10 >> 8 ) & 0xff ) );
		break;
	  case 2:
		b10 = ( _getbyte64( s, i ) << 18) | ( _getbyte64( s, i + 1 ) << 12 );
		x.push( String.fromCharCode( b10 >> 16 ) );
		break;
	}
	return x.join( "" );
  }
  function _getbyte( s, i ) {
	var x = s.charCodeAt( i );
	if ( x > 255 ) {
	  throw "INVALID_CHARACTER_ERR: DOM Exception 5";
	}
	return x;
  }
  function _encode( s ) {
	if ( arguments.length !== 1 ) {
	  throw "SyntaxError: exactly one argument required";
	}
	s = String( s );
	var i,
	  b10,
	  x = [],
	  imax = s.length - s.length % 3;
	if ( s.length === 0 ) {
	  return s;
	}
	for ( i = 0; i < imax; i += 3 ) {
	  b10 = ( _getbyte( s, i ) << 16 ) | ( _getbyte( s, i + 1 ) << 8 ) | _getbyte( s, i + 2 );
	  x.push( _ALPHA.charAt( b10 >> 18 ) );
	  x.push( _ALPHA.charAt( ( b10 >> 12 ) & 0x3F ) );
	  x.push( _ALPHA.charAt( ( b10 >> 6 ) & 0x3f ) );
	  x.push( _ALPHA.charAt( b10 & 0x3f ) );
	}
	switch ( s.length - imax ) {
	  case 1:
		b10 = _getbyte( s, i ) << 16;
		x.push( _ALPHA.charAt( b10 >> 18 ) + _ALPHA.charAt( ( b10 >> 12 ) & 0x3F ) + _PADCHAR + _PADCHAR );
		break;
	  case 2:
		b10 = ( _getbyte( s, i ) << 16 ) | ( _getbyte( s, i + 1 ) << 8 );
		x.push( _ALPHA.charAt( b10 >> 18 ) + _ALPHA.charAt( ( b10 >> 12 ) & 0x3F ) + _ALPHA.charAt( ( b10 >> 6 ) & 0x3f ) + _PADCHAR );
		break;
	}
	return x.join( "" );
  }
  return {
	decode: _decode,
	encode: _encode,
	VERSION: _VERSION
  };
}( jQuery ) );

(function($) {
	"use strict";
	Object.keys = Object.keys || function(o) {
		var result = [], name = null;
		for(name in o) {
			if (o.hasOwnProperty(name)) {
			  result.push(name);
			}
		}
		return result;
	};
}(jQuery));

// Extensions de l'objet Date
(function(){
	/**
	 * vérification des éléments d'une date
	 * @param  String string 	la chaine de caractère à tester
	 * @param  Int nbChar 		le nombre de caractères normal pour le segment de date (2|4)
	 * @return Boolean        	indique si le segment est correct
	 */
	var verifierElementsDate = function(string, nbChar){
		if(string != null && nbChar != null){
			if(string.length == nbChar){
				if(!isNaN(parseInt(string))){
					return string;
				}
			}else{
				if(!isNaN(parseInt(string))){
					if(parseInt(string) < 10 && nbChar == 2){
						return "0" + string;
					}
				}
			}
		}
		return false;
	};

	/**
	 * vérifie si l'objet est une date
	 * @param  Object  date l'objet à tester
	 * @return Boolean 		indique si l'objet est bien une date
	 */
	var isDate = function(date) {
		return (Object.prototype.toString.call(date) === "[object Date]") ? true : false;
	};

	/**
	 * Converti une date au format français (jj/mm/aaaa) en une date au format anglais (yyyy/mm/dd)
	 * @param  String dateFr 	la date à convertir au format jj/mm/aaaa
	 * @return Date      		la date convertie au format yyyy/mm/dd
	 */
	Date.prototype.convertFrToEnFormat = function(dateFr) {
		if(dateFr != null){
			var vJour = verifierElementsDate(dateFr.substr(0, 2), 2),
				vMois = verifierElementsDate(dateFr.substr(3, 2), 2),
				vAnnee = verifierElementsDate(dateFr.substr(6, 4), 4);
			if(vJour !== false && vMois !== false && vAnnee !== false){
				return new Date(vAnnee, vMois - 1 , vJour);
			}
		}
		return null;
	};

	/**
	 * récupère le temps qui sépares 2 dates
	 * @param  Date dateDebut La date référence de début
	 * @param  Date dateFin   la date référence de fin (optionnelle - si non renseignée on se base sur la date du jour)
	 * @param {String} unite  l'unité dans laquelle sera retournée le temps écoulé
	 * @return Int 		      le temps écoulé entre les 2 dates (en unité)
	 */
	Date.prototype.getAge = function(dateFin, unite) {
		if(this.isValid()){
			var denominateur = 1,
				mapUnite = {
					year: 31536000000,
					month: 2628000000,
					week: 604800000,
					day: 86400000,
					hour: 3600000,
					minute: 60000,
					seconds: 1000,
					default: 1
				};
			denominateur = (unite != null && mapUnite.hasOwnProperty(unite)) ? mapUnite[unite] : mapUnite.default;
			if(dateFin == null){
				dateFin = new Date();
			}
			return Math.floor((dateFin.getTime() - this.getTime()) / denominateur)
		}
		return false;
	};

	/**
	 * Vérifie si une date est valide
	 * @return {Boolean}      [indique si la date est valide]
	 */
	Date.prototype.isValid = function() {
		if (isDate(this)) {
			return (isNaN(this.getTime())) ? false : true;
		} else {
			return false;
		}
	};
})();

// Extensions de l'objet Number
(function(){
	/**
	 * Converti un nombre (angle) en Radians
	 * @return {Number}	un angle en radian
	 */
	Number.prototype.toRadians = function() {
		return this * (Math.PI / 180);
	};

	/**
	 * Converti un nombre (angle) en Degrés
	 * @return {Number} un angle en Degrés
	 */
	Number.prototype.toDegrees = function() {
		return this * (180 / Math.PI);
	};

	Number.prototype.convertMinutesToHours = function(){
		return Math.round(this / 60) + "h" + (this % 60) + "min";
	};

	Number.prototype.roundWithDecimal = function(decimals){
		if(typeof decimals === "undefined" || decimals === null){ decimals = 0; }
		return (decimals != 0) ? Math.round(this * Math.pow(10, decimals)) / Math.pow(10, decimals) : Math.round(this);
	};
})();

// Extensions de l'objet Array
(function(){
	Array.prototype.joinObject = function(delimiter, nodesToShow, allowEmptyString) {
		if(typeof allowEmptyString === "undefined" || allowEmptyString === null){ allowEmptyString = false; }
		if(typeof delimiter === "undefined" || delimiter === null){ delimiter = ', '; }
		if(delimiter != null && this != null && this.length){
			if(nodesToShow == null){
				return this.join(delimiter);
			}else if(nodesToShow != null && nodesToShow.length){
				var i = 0, listeChaines = [];
				for(i; i < this.length; i++){
					var j = 0, element = "";
					for(j; j < nodesToShow.length; j++){
						if(this[i].hasOwnProperty(nodesToShow[j])){
							element += this[i][nodesToShow[j]]();
						}
					}
					if(allowEmptyString || (!allowEmptyString && element != "")){
						listeChaines.push(element);
					}
				}
				if(listeChaines.length){
					return listeChaines.join(delimiter);
				}
			}
		}
		return null;
	};

	Array.prototype.average = function(numberList, decimals) {
		if(typeof decimals === "undefined" || decimals === null){ decimals = 0; }
		if(numberList != null && numberList.length){
			var sum = 0, i = 0;
			for(i; i < numberList.length; i++){
				sum += numberList[i];
			}
			if(decimals == 0){
				return sum / numberList.length;
			}
		}else{
			return 0;
		}
	};

	Array.prototype.pushNotNull = function(value){
		if(value != null){
			this.push(value);
		}
		return this;
	};
})();

// Extensions jQuery
jQuery.fn.extend({
	appendSvg:function (nom, attributs) {
		var svg = null;
		if(nom != null && attributs != null){
			svg = document.createElementNS("http://www.w3.org/2000/svg",nom)
			for (var cle in attributs) {
				if(cle != "textContent") {
					svg.setAttribute(cle,attributs[cle]);
				}else{
					svg.textContent = attributs[cle];
				}
			}
			for (var i = 0; i < this.length; i++) {
				this[i].appendChild(svg);
			}
		}
		return svg;
	}
});
jQuery.extend({
	isNullOrEmpty: function(chaine) {
		return (typeof chaine === "undefined" || chaine === null || chaine === "") ? true : false;
	}
});

(function($) {
	$.coreScreen = function(element, options) {
		var defaults = { },
			plugin = this,
			$element = $(element), element = element,
			classNames = {
				screenCache: "screenCache",
				screenContainer: "screensContainer",
				screen: 'screen',
				currentScreen: 'currentScreen',
				switchCache: 'switchCache'
			},
			$screenContainer = null, $screens = null, $switchCache = null,
			screenWidth = $element.innerWidth();

		plugin.settings = {};

		plugin.init = function() {
			plugin.settings = $.extend({}, defaults, options);
			$element.addClass(classNames.screenCache);
			attachEvents();
			initScreenContainer();
		}

		plugin.goToScreen = function(indexScreen, callback) {
			if(typeof indexScreen !== "undefined" && indexScreen !== null){
				var toLeft = screenWidth * indexScreen,
					$screen = $element.find(".screen[data-screen='" + indexScreen + "']");
				$switchCache.animate({ 'width': screenWidth }, 300, function() {
					var animateTime = 100;
					$switchCache.css("left", 0).animate({ 'width': 0 }, animateTime, function() {
						$switchCache.css({ "right": 0, "left": "" });
					});
					$screenContainer.css("left", toLeft).animate({ 'left': -toLeft }, animateTime, function() {
						$(".currentScreen").removeClass("currentScreen");
						$screen.addClass('currentScreen');
						if($.isFunction(callback)){
							callback();
						}
					});
				});
			}
		};

		var initScreenContainer = function() {
			$element.find('> div').wrapAll($("<div></div>").addClass(classNames.screenContainer));
			$screenContainer = $element.find("." + classNames.screenContainer).first();
			initScreens();
			initSwitchCache();
			$screenContainer.width(screenWidth * $screens.size());
		},

		initSwitchCache = function(){
			$("<div></div>").addClass(classNames.switchCache).prependTo($screenContainer);
			$switchCache = $element.find("." + classNames.switchCache).first();
		},

		initScreens = function(){
			$screens = $screenContainer.find("> div");
			$screens.each(function(index){
				if(index == 0){
					$(this).addClass(classNames.currentScreen);
				}
				$(this).addClass(classNames.screen).attr({ "data-screen": index }).css({ 'width': screenWidth - 30 });
			});
			return $screens;
		},

		attachEvents = function(){
			$(window).on("resize", function(){
				if($element.size()){
					screenWidth = $element.innerWidth();
				}
			});
		};

		plugin.init();
	}

	// add the plugin to the jQuery.fn object
	$.fn.coreScreen = function(options) {
		return this.each(function() {
			if (undefined == $(this).data('coreScreen')) {
				var plugin = new $.coreScreen(this, options);
				// in the jQuery version of the element
				// store a reference to the plugin object
				// you can later access the plugin and its methods and properties like
				// element.data('pluginName').publicMethod(arg1, arg2, ... argn) or
				// element.data('pluginName').settings.propertyName
				$(this).data('coreScreen', plugin);
			}
		});
	}
})(jQuery);