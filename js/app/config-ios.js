define([
	"Underscore",
	"app/config"
], function( _, Config ) {
	
	var ios = _.extend(Config, {
		chatanoo: {
			anonymous_user: {
				pass: "bou"
			}
		}
	});
	
	return ios;
});