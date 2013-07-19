var Student = Backbone.Model.extend({
	initialize: function(){

	},
	getName: function() {
		return this.get('firstname') + ' ' + this.get('lastname');
	}
});
var Students = Backbone.Collection.extend({
	model: Student,
	url: "/students"
})

var StudentsIndexView = Backbone.View.extend({
	events: {
		"click .student" : "showStudentDetails",
		"click .addStudent": "showAddStudentScreen"
	},
	tagName: "div",
	id: "accordion",
	render: function() {
		$(this.el).html(Mustache.to_html(this.options.template,{students: this.collection.models})); 
		$(this.el).find('.studentsBox').each(function() {$(this).button()});
		return this;
	},
	showAddStudentScreen: function(e) {
		moderator.setMainScreenAddStudent();
	}
});

var AddStudentView = Backbone.View.extend({
	events: {
		'click .submitButton': 'submit'
	},
	render: function () {
		//$(this.el).off('click');
		$(this.el).html(this.options.template.html());
		$(this.el).find("button.submitButton").button();
		//$(this.el).on('click', ".submitButton" , this.submit);

		return this;
	},
	submit: function(e) {
		e.preventDefault();
		var form = $(this.el).find('#studentDetails')

		var firstname = form.find('input[name=firstname]').val();
		var lastname = form.find('input[name=lastname]').val();
		var address1 = form.find('input[name=address1]').val();
		var address2 = form.find('input[name=address2]').val();
		var phone = form.find('input[name=phone]').val();
		var email = form.find('input[name=email]').val();
		var create_user = form.find('input[name=create_user]').is(':checked');
		var mail_student = form.find('input[name=mail_student]').is(':checked');

		allStudents.create({
            'firstname': firstname,
            'lastname': lastname,
            'address1': address1,
            'address2': address2,
            'phone': phone,
            'email': email,
            'mail_student': mail_student,
            'create_user': create_user
        },
        {
        	success: function(){
        		moderator.showDialog('generalDialog', {
        			title: "Success",
        			text: "Registratie gelukt!"
        		})
        	},
    		error: function(model, response, options){
				standardHTTPErrorHandling(model, response, options);
			}
		});
	}
})
