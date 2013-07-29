var Student = Backbone.Model.extend({
	initialize: function(){

	},
	getName: function() {
		return this.get('firstname') + ' ' + this.get('lastname');
	},
	defaults: {
	},
	urlRoot: "/students",
	validate: function(attrs, options){
		var blanks = false;
		var defaultError = false;
		var defaultStudent = new Student();
		var attributesToCheck = ["firstname", "lastname","address1", "address2","phone"];
 		_.each(attributesToCheck, function(element, index, list){
 			if (attrs[element] == '') {blanks = true}
 			if (attrs[element] == defaultStudent.get([element])){defaultError= true}
 		});
 		if (blanks) {return 'Alle waarden moeten ingevuld zijn.'}
 		if (defaultError) {return 'Alle waarden moeten verschillen van de voorbeeldwaarden.'}
	}
});
var Students = Backbone.Collection.extend({
	model: Student,
	url: "/students"
})

var StudentsIndexView = Backbone.View.extend({
	events: {
		"click .student" : "showStudentDetails",
		"click .addStudent": "showAddStudentScreen",
		"click #searchStudent": "searchStudent"
	},
	tagName: "div",
	id: "accordion",
	render: function() {
		$(this.el).html(Mustache.to_html(this.options.template,{students: this.collection.models})); 
		$(this.el).find('.studentsBox').each(function() {$(this).button()});
		$(this.el).find('.addStudent').button({
			icons: {
				secondary: "ui-icon-circle-plus"
			}
		});
		$(this.el).find('#searchStudent').button({
			icons: {primary: "ui-icon-search"},
		    text: false
		});

		if (this.collection.length == 1){
			moderator.setMainScreenShowStudent(this.collection.at(0));
		}
		return this;
	},
	showAddStudentScreen: function(e) {
		moderator.setMainScreenEditStudent();
	},
	showStudentDetails: function(e){
		var id = $(e.currentTarget).data("id");
		var student = this.collection.get(id);
		moderator.setMainScreenShowStudent(student);
	},
	searchStudent: function(e){
		var string = $(this.el).find('input[name=searchStudent]').val();
		if (!this.originalCollection){
			this.originalCollection = this.collection;
		}
		if (string == ''){this.collection = this.originalCollection}
		else {
			this.collection = new Students();
			this.originalCollection.each( function(element, index, list){
				if (element.get('firstname').startsWith(string) || element.get('lastname').startsWith(string)) {
					this.collection.add(element);
				}
			}, this);
		}
		this.render();
	}
});

var EditStudentView = Backbone.View.extend({
	events: {
		'click .submitButton': 'submit',
		'click .passwordButton': 'changePassword'
	},
	render: function () {
		if (this.student === undefined) {
			// this.newStudent = true;
			this.student = new Student();
		}
		$(this.el).html((Mustache.to_html(this.options.template.html(), this.student.toJSON())));
		$(this.el).find("button").button();

		return this;
	},
	submit: function(e) {
		e.preventDefault();
		var form = $(this.el).find('#editStudent');
		// var changedEmail = false;
		// if (form.find('input[name=email]').val() != this.student.email){
		// 	changedEmail = true;
		// }

		this.student.set('firstname', form.find('input[name=firstname]').valplace());
		this.student.set('lastname', form.find('input[name=lastname]').valplace());
		this.student.set('address1', form.find('input[name=address1]').valplace());
		this.student.set('address2', form.find('input[name=address2]').valplace());
		this.student.set('phone', form.find('input[name=phone]').valplace());
		this.student.set('email', form.find('input[name=email]').valplace());
		//var create_user = form.find('input[name=create_user]').is(':checked');
		//var mail_student = form.find('input[name=mail_student]').is(':checked');
		var student = this.student;
		// var newStudent = this.newStudent;

		if (this.student.isValid()){
			this.student.save(null,{
				success: function(model, response){
					allStudents.set(student,{remove: false});
					moderator.reloadSidebar();
					moderator.setMainScreenShowStudent(student);
					if (('new_user' in response) && response.new_user == true) {
						moderator.showDialog('passwordDialog', {
							text: "Registratie gelukt! We hebben je het standaardpaswoord 'rockschool' gegeven.",
							user_id: model.get('user_id')
						})
					}
					else {
						moderator.showDialog('generalDialog', {
		        			title: "Succes",
		        			text: "Registratie gelukt!"
		        		});
					}
	        	},
	    		error: function(model, response, options){
					standardHTTPErrorHandling(model, response, options);
				}
			});
		}
		else {
			standardValidationErrorHandling(this.student);
		}
	},
	changePassword: function(e){
		e.preventDefault();
		moderator.showDialog('passwordDialog', {
			user_id: this.student.get('user_id')
		})
	}
});
var ShowStudentView = Backbone.View.extend({
	events: {
		'click .editButton': 'edit'
	},
	id: "showStudent",
	render: function (){
		$(this.el).html((Mustache.to_html(this.options.template.html(), this.student.toJSON())));
		$(this.el).find("button.editButton").button();
		this.setElement($('#' + this.id));

		var enrollments = new Enrollments();
		
		var self = this;
		enrollments.fetch({
			data: {'student_id': this.student.id},
			success: function(model, response, options){
				var enrollmentsDiv = $(self.el).find('#enrollments');
				model.renderInto({
					el: enrollmentsDiv,
					label: "teacherName"
				});
			}
		});

		return this;
	},
	edit: function(){
		moderator.setMainScreenEditStudent(this.student);
	}
})
