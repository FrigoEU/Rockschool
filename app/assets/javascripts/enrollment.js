var Enrollment = Backbone.Model.extend({
	urlRoot: "/enrollments",
	parse: function(response){
		var result = _.clone(response);
		var startTime = new Date(response.starttime);
		var endTime = new Date(response.endtime);
		result.startTime = startTime;
		result.endTime = endTime;
		return result;
	}
});
var Enrollments = Backbone.Collection.extend({
	model: Enrollment,
	url: "/enrollments",
	renderInto:function(options){
		var el = options.el;
		var label = options.label;
		_.each(this.models, function(value, key, list){
			var singleEnrollmentDiv = $('<div></div>');
			el.append(singleEnrollmentDiv);
			var enrollmentBox = new EnrollmentBoxView({
				enrollment: value,
				el: singleEnrollmentDiv,
				label: label
			});
			enrollmentBox.render();
		});
	}
});

var EnrollmentDialogView = Backbone.View.extend({
	initialize: function () {
		_.bindAll(this);
	},
	tagName: "div",
	id:"enrollmentDialog",
	events: {
	},
	render: function() {
		var studentName = '';
		if (current_student !== undefined) {studentName = current_student.getName()}

		$("body").append(Mustache.render(
			this.options.template.html(),{
			"studentName": studentName,
			"teacherName": this.teacher.get('name'),
			"teachingDay": this.startTime.toString("ddd dd MMM yyyy"),
			"startLessonHour": this.startTime.toString("HH:mm")
		}));
		var enrollmentDialog = $('#'+this.id);
		//console.log("enrollmentDialog = " + enrollmentDialog);

		enrollmentDialog.dialog({
			autoOpen: true,
			height: 400,
			width: 450,
			modal: true,
			buttons:{
					"Voer inschrijving in": this.makeEnrollment,
					Cancel: function() {
								$( this ).dialog( "close" );
						}
				},
				close: function() {
						//allFields.val( "" ).removeClass( "ui-state-error" );
						$('#enrollmentDialog').remove();
				}
		});
		var source = _.map(allStudents.models, function (value, key, list) {
				return {label: value.getName(), id: value.id}
			});
		var self = this;
		enrollmentDialog.find( "#studentsSelect" ).autocomplete({
			minLength: 0,
      		source: source,
      		select: function( event, ui ) {
		        $( "#studentsSelect" ).val( ui.item.label );
		        self.selectedStudent = allStudents.get(ui.item.id);
		        return false;
		    }
    	})
    	.data( "ui-autocomplete" )._renderItem = function( ul, item ) {
	      return $( "<li>" )
	        .append( "<a>" + item.label + "</a>" )
	        .appendTo( ul );
	    };

	},
	makeEnrollment: function(){
		var type = $('input:radio[name="enrollmentType"]:checked').val();
		var startTime = this.startTime;
		//startTime.addMinutes(-this.startTime.getTimezoneOffset()); //Vuil, maar anders lukte het niet... Mss later nog eens herbekijken
		var student;
		if (current_student !== undefined) {student = current_student}
		else {student = this.selectedStudent}
		var enrollment = new Enrollment({
			student: student,
			teacher: this.teacher,
			startTime: this.startTime,
			duration: this.duration,
			type: type,
			lessongroup_id: this.lessongroup_id
		});
		enrollment.save(null, {
			success: function(model, response, options){
				$('#enrollmentDialog').remove();
				var lessons = model.get("lessons");
				for (var i = 0; i < lessons.length; i++) {
					var lesson = Lesson.prototype.parse(lessons[i]);
					moderator.addLessonToActiveSchedule(lesson);
				}
				
				moderator.reloadMainscreen();
			},
			error: function(model, response, options) {
				standardHTTPErrorHandling(model, response, options);
			}
		});
	}
});

var EnrollmentBoxView = Backbone.View.extend({
	initialize: function(){
		this.template = $('#enrollmentBoxTemplate');
	},
	events: {
		"click .enrollment": "showEnrollmentDropDown"
	},
	render: function(){
		var text;
		switch (this.options.label){
			case "studentName":
				text = allStudents.get(this.options.enrollment.get('student_id')).getName();
			break;
			case "teacherName":
				text = allTeachers.get(this.options.enrollment.get('teacher_id')).getName();
			break;
		}
		var argumentHash = {text: text};
		argumentHash = _.extend(argumentHash, this.options.enrollment.toJSON());
		$(this.el).html(Mustache.to_html(this.template.html(), argumentHash));
	},
	showEnrollmentDropDown: function(){
		moderator.showEnrollmentDropDown(event.pageX, event.pageY, this.options.enrollment, this);
	}
});
var EnrollmentActions = {
	accept: {
		key:'accept',
		action: 'acceptenrollment', 
		label: 'Accepteer inschrijving', 
		func: function(callback){
			this.save({'approved': true},{success: function(){callback.apply();}});
		}
	},
	reject: {
		key: 'reject',
		action:'removeenrollment', 
		label: 'Keur inschrijving af',
		func: function(callback){
			this.destroy({success: function(){
				callback.apply();
			}});
		}
	},
	pay: {
		key: 'pay',
		action: 'payenrollment', 
		label: 'Betaling inschrijving OK',
		func: function(callback){
			this.save({'paid': true},{success: function(){callback.apply();}});
		}
	},
	removeenrollment: {
		key: 'removeenrollment',
		action:'removeenrollment', 
		label: 'Verwijder inschrijving',
		func: function(callback){
			this.destroy({success: function(){
				callback.apply();
			}});
		}
	}
};
var EnrollmentsSearchStatussesArray = [{key: "unpaid", name: "Onbetaald"}, {key: "unapproved", name:"Nog niet goedgekeurd"}];

var EnrollmentDropDownView = DropDownView.extend({
	initialize: function(){
		this.template = $('#enrollmentDropDownTemplate');
	},
	events: {
		"click .status": "changeStatus",
	},
	renderInnerHTML: function(){
		if (current_user_role == "admin") {
			var choices = [EnrollmentActions.removeenrollment];
		
			if (this.options.enrollment.get('approved') == false){
				choices.push(EnrollmentActions.accept);
				choices.push(EnrollmentActions.reject);
				_.each(choices, function(value, key, list){
						if (list[key] == EnrollmentActions.removeenrollment){list.splice(key, 1);}
					})
			}
			else if (this.options.enrollment.get('paid') == false){choices.unshift(EnrollmentActions.pay);}
		}
		
		var argumentHash= {
			student: allStudents.get(this.options.enrollment.get("student_id")).toJSON(),
			teacher: allTeachers.get(this.options.enrollment.get("teacher_id")).toJSON(),
			datetime: this.options.enrollment.get('startTime').toString("dddd, HH:mm"),
			choicesmenu: (choices.length > 0),
			choices: choices
		};
		argumentHash = _.extend(argumentHash, this.options.enrollment.toJSON());
		return Mustache.render(this.template.html(),argumentHash);
	},
	changeStatus: function(e){
		var enrollmentAction = EnrollmentActions[$(e.target).data("key")];
		var self = this;
		enrollmentAction.func.apply(this.options.enrollment, [function(){self.options.originatingView.render();}]);
	}
});
var EnrollmentsSearchView = Backbone.View.extend({
	initialize: function () {

	},
	events: {
		"click input[type=radio]": "searchEnrollments"
	},
	render: function(){
		//To Do: map lessons naar array van hashes met oa. student name in!!
		$(this.el).html(Mustache.to_html(this.options.template.html(),{statusses: EnrollmentsSearchStatussesArray}));
		$(this.el).find("#statusses").buttonset();
		$(this.el).find("#enrollments").remove(); 
		$(this.el).find('#searchScreen').append('<div id="enrollments"></div>');
		this.collection.renderInto({ 
			el: $(this.el).find('#enrollments'),
			label: "studentName"
		});
		return this;
	},
	searchEnrollments: function(event){
		var status = event.currentTarget.value;
		console.log("status = ", status);
		var self = this;
		this.collection.fetch({
			data: {'inquirystatus': status},
			success: function(model, response, options){
				self.render();
			},
			error: function(model, response, options){
				standardHTTPErrorHandling(model, response, options);
			}
		});
	}
});
