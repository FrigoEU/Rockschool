var User = Backbone.Model.extend({
	urlRoot: '/users'
});
var LoginView = Backbone.View.extend({
	id: 'login',
	events: {
		"click .submitButton": "login"
	},
	render: function(){
		$(this.el).html(this.options.template);
		$(this.el).find('.submitButton').each(function() {$(this).button()});
		return this;
	},
	login: function(e){
		e.preventDefault();
		var email = $(this.el).find('input[name=email]').val();
		var password = $(this.el).find('input[name=password]').val();
		var myUser = new User();
		myUser.fetch({
			data: {'email': email, 'password': password},
			success: function(model, response, options){
				moderator.showMainScreenTeacherIndex();
			},
			error: function(model, response, options){
				var errors = $.parseJSON(response.responseText).errors;
				if (errors.length == 0){alert('Systeemfout');}
				else {alert('Fout: ' + errors);}
			}
		})
	}
})