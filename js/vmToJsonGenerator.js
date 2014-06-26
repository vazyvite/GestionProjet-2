var vmToJsonGenerator = function(){
	var self = this,
		jsonText = "",

	generateValue = function(){
		return "aaaaa";
	},

	stringify = function(word){
		if(word != null){
			return '"' + word + '"';
		} else {
			return null;
		}
	},

	insertVirgule = function(){
		var derniereLettre = jsonText.substr(jsonText.length - 1, 1),
			listeLettresPreVirgules = ['}', ']', '"'];
		return ($.inArray(derniereLettre, listeLettresPreVirgules) != -1) ? "," : "";
	},

	generateObject = function(objectVM){
		if(objectVM != null){
			for(var champ in objectVM){
				var source = objectVM[champ],
					isFunction = ($.isFunction(source)) ? true : false,
					typeSource = (isFunction) ? ko.jsam.utils.getType(source()) : ko.jsam.utils.getType(source);
				if(typeSource === "undefined" || typeSource === "string"){
					jsonText += insertVirgule() + stringify(champ) + ":" + stringify(generateValue());
				}else if(typeSource === "object"){
					jsonText += insertVirgule() + stringify(champ) + ": {";
					generateObject((isFunction) ? source() : source);
					jsonText += "}";
				}else if(typeSource === "array"){
					jsonText += insertVirgule() + stringify(champ) + ": [";
					if(source.getType() &&
						vm.hasOwnProperty("new" + source.getType()) &&
						$.isFunction(vm["new" + source.getType()])) {
						for(var i = 0; i < 1 + Math.round(Math.random() * 9); i++){
							generateObject(vm["new" + source.getType()]());
						}
					}
					jsonText += "]";
				}
			}
		}
	};

	self.generate = function(objectVM, rootName){
		if(objectVM != null && $.isPlainObject(objectVM) && rootName != null){
			var typeSource = ($.isFunction(objectVM)) ? ko.jsam.utils.getType(objectVM()) : ko.jsam.utils.getType(objectVM);
			if(typeSource == "object"){
				jsonText += stringify(rootName) + ": {";
				generateObject(objectVM);
				jsonText += "}";
			}else if(typeSource == "array"){
				jsonText += stringify(rootName) + ": [";
				if(objectVM.getType() && vm.hasOwnProperty("new" + objectVM.getType()) && $.isFunction(vm["new" + objectVM.getType()])){
					for(var i = 0; i < 1 + Math.round(Math.random() * 9); i++){
						generateObject(vm["new" + objectVM.getType()]());
					}
				}
				jsonText += "]";
			}
			console.log(jsonText);
		}
	};
};