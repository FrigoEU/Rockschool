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
			var success = function(model, response){
				$('#'+this.id).dialog("close");
        		moderator.showDialog('generalDialog', {
        			title: "Succes",
        			text: "Paswoord opgeslagen!"
        		});
        	}
        	success = _.bind(success, this);
			user.save(null,{
				success: success,
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

var PasswordConfirmationDialog = Backbone.View.extend({
	initialize: function (){
	},
	id: 'passwordConfirmationDialog',
	render: function (){
		if (this.text === undefined){this.text = ''}
		if (this.title === undefined){this.title = 'Paswoord invoeren'}
		$("body").append(Mustache.render(
			this.options.template.html(),{
				"text": this.text,
				"title": this.title
		}));
		this.setElement($('#'+this.id));

		var OKCB = this.OKCB;

		$(this.el).dialog({
			autoOpen: true,
			height: 350,
			width: 450,
			modal: true,
			buttons:{
					OK:  function(){
						$( this ).dialog( "close" );
						OKCB({password: $(this).find('input[name=password]').val()});
					},
					Sluiten: function() {
						$( this ).dialog( "close" );
					}
				},
				close: function() {
						//allFields.val( "" ).removeClass( "ui-state-error" );
						$('#passwordConfirmationDialog').remove();
				}
		});
	}
});