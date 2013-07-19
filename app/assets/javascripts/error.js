var GeneralDialog = Backbone.View.extend({
	initialize: function (){
	},
	id: 'generalDialog',
	render: function (){
		$("body").append(Mustache.render(
			this.options.template.html(),{
				"title": this.title,
				"text": this.text
		}));
		var generalDialog = $('#'+this.id);

		generalDialog.dialog({
			autoOpen: true,
			height: 250,
			width: 450,
			modal: true,
			buttons:{
					Sluiten: function() {
								$( this ).dialog( "close" );
						}
				},
				close: function() {
						//allFields.val( "" ).removeClass( "ui-state-error" );
						$('#generalDialog').remove();
				}
		});
	}
});
var standardHTTPErrorHandling = function(model, response, options){
	var errors = $.parseJSON(response.responseText).errors;
	if (errors.length == 0){moderator.showDialog('generalDialog', {text: 'Systeemfout'});}
	else {moderator.showDialog('generalDialog', {
		title: "Fout",
		text: 'Fout: ' + errors
	});}
}
