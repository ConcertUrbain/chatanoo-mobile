define([
	"Underscore",
	"app/config"
], function( _, Config ) {
	
	var ios = _.extend({
		chatanoo: {
			anonymous_user: {
				pass: "bou"
			}
		}
	}, Config);
	
	return ios;
});