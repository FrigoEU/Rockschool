var User = Backbone.Model.extend({
	urlRoot: '/users'
});
var PasswordDialog = Backbone.View.extend({
	initialize: function (){
	},
	id: 'passwordDialog',
	render: function (){
		if (this.text === undefined){this.text = ''}
		$("body").append(Mustache.render(
			this.options.template.html(),{
				"text": this.text
		}));
		var passwordDialog = $('#'+this.id);
		var confirm = function(){
			var user = new User({
				id: this.user_id,
				password: passwordDialog.find('input[name=password]').val(),
				password_confirmation: passwordDialog.find('input[name=password_confirmation]').val()
			});
			user.save(null,{
				success: function(model, response){
	        		moderator.showDialog('generalDialog', {
	        			title: "Succes",
	        			text: "Paswoord opgeslagen!"
	        		});
	        	},
	    		error: function(model, response, options){
					standardHTTPErrorHandling(model, response, options);
				} 
			});

		}
		confirm = _.bind(confirm, this);

		passwordDialog.dialog({
			autoOpen: true,
			height: 350,
			width: 450,
			modal: true,
			buttons:{
					OK:  confirm,
					Sluiten: function() {
						$( this ).dialog( "close" );
					}
				},
				close: function() {
						//allFields.val( "" ).removeClass( "ui-state-error" );
						$('#passwordDialog').remove();
				}
		});
	}
});