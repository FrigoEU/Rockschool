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

		$.ajax({
			url: window.location.href + '/signin',
			data: {'email': email, 'password': password},
			success: function(data,textStatus,jqXHR){
				location.reload(true);
			},
			error: function(jqXHR,textStatus,errorThrown){
				standardHTTPErrorHandling(null, jqXHR, null);
			}
		})
	}
})
var logout = function(){
	$.ajax({
			url: window.location.href + '/signout',
			success: function(data,textStatus,jqXHR){
				location.reload(true);
			},
			error: function(jqXHR,textStatus,errorThrown){
				standardHTTPErrorHandling(null, jqXHR, null);
			}
		})
}
