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
	initialize: function(){
		_.bindAll(this, 'render', 'submit', 'saveStudent', 'changePassword');
	},
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

		this.email = this.student.get('email');

		return this;
	},
	submit: function(e) {
		e.preventDefault();
		var form = $(this.el).find('#editStudent');
			
		this.emailChanged = (this.email != form.find('input[name=email]').valplace());

		this.student.set('firstname', form.find('input[name=firstname]').valplace());
		this.student.set('lastname', form.find('input[name=lastname]').valplace());
		this.student.set('address1', form.find('input[name=address1]').valplace());
		this.student.set('address2', form.find('input[name=address2]').valplace());
		this.student.set('phone', form.find('input[name=phone]').valplace());

		// var newStudent = this.newStudent;

		if (this.student.isValid()){
			if (this.emailChanged) {
				var email = form.find('input[name=email]').valplace();
				var user = new User({email: email});
				this.student.set('user', user);

				var userFetchCallback = function(model, response, options){
					var newUser = (model.id == undefined);
					if (newUser){
						// nieuwe user --> geen user_id in model, wel user_attributes
						delete this.student.attributes['user_id']; 
						this.saveStudent({newUser: true});
					}
					else {
						//bestaande user --> gooi user_attributes weg en vul user_id in 
						delete this.student.attributes['user'];
						this.student.set('user_id',model.id);
						moderator.showDialog('passwordConfirmationDialog', {
							title: "Paswoord invoeren",
							text: "Het emailadres dat je hebt ingegeven is reeds in gebruik. Als je je onder hetzelfde emailadres wil inschrijven, geef dan het correcte wachtwoord in.",
							OKCB: this.saveStudent
						});
					}
				}
				userFetchCallback = _.bind(userFetchCallback, this);
				user.fetch({
					data: {email: email},
					success: userFetchCallback,
					error: standardHTTPErrorHandling
				});
			}
			else {
				//Als de email niet is veranderd save je gewoon de student
				this.saveStudent();
			}
		}
		else {
			standardValidationErrorHandling(this.student);
		}
	},
	saveStudent: function(params){

		//Bestaande user --> paswoord nodig
		if (params.password){this.student.set('password', params.password);}

		var studentSaveSuccess =  function(model, response, options){
			allStudents.set(this.student,{remove: false});
			moderator.reloadSidebar();
			moderator.setMainScreenShowStudent(this.student);
			//Als je een nieuwe user maakte, moet je de user de kans geven om het standaardpaswoord aan te passen
			if (params.newUser){
				moderator.showDialog('passwordDialog', {
					text: "Registratie gelukt! We hebben je het standaardpaswoord 'rockschool' gegeven. Vul hier je eigen paswoord in",
					user_id: model.get('user_id')
				})
			}
			else {
				moderator.showDialog('generalDialog', {
	    			title: "Succes",
	    			text: "Registratie gelukt!"
	    		});
			}
		}
		studentSaveSuccess = _.bind(studentSaveSuccess, this);

		this.student.save(null, {
			success: studentSaveSuccess,
			error: standardHTTPErrorHandling
		})
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
