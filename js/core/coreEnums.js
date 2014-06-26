function CoreEnums(){
	var self = this,
	codes = {
		pathParameterFile: "./js/core/parameters.json",
		typeMessagesError: {
			"0": "SUCCESS",
			"1": "WARNING",
			"2": "ERROR"
		}
	}

	self.getPathParameterFile = function(){
		return codes.pathParameterFile;
	};

	self.getLibelleTypeMessageErrorByCode = function(codeTypeMessageError){
		if(codeTypeMessageError != null && codes.typeMessagesError.hasOwnProperty(codeTypeMessageError)) {
			return codes.typeMessagesError[codeTypeMessageError];
		} else {
			throw "getLibelleTypeMessageErrorByCode : pas de libellé correspondant pour le code " + codeTypeMessageError;
		}
	};
};