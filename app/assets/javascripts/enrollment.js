var Enrollment = Backbone.Model.extend({
	//teacher
	//student
	//lessongroup
	//type
	//startTime
	//duration
	url: "/enrollments"

});
var Enrollments = Backbone.Collection.extend({
	model: Enrollment,
	url: "/enrollments"
});

var EnrollmentDialogView = Backbone.View.extend({
	initialize: function () {
		//student
		//teacher
		//startTime
		//duration
		//lessongroup
		_.bindAll(this);

	},
	tagName: "div",
	id:"enrollmentDialog",
	events: {
	},
	render: function() {
		$("body").append(Mustache.render(
			this.options.template.html(),{
			"studentName": this.student.get('name'),
			"teacherName": this.teacher.get('name'),
			"teachingDay": this.startTime.toString("ddd dd MMM yyyy"),
			"startLessonHour": this.startTime.toString("HH:mm")
		}));
		var enrollmentDialog = $('#'+this.id);
		//console.log("enrollmentDialog = " + enrollmentDialog);

		enrollmentDialog.dialog({
			autoOpen: true,
			height: 300,
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

		//$('#enrollmentDialog').children('#spinner').spinner();
	},
	makeEnrollment: function(){
		var type = $('input:radio[name="enrollmentType"]:checked').val();
		var startTime = this.startTime;
		//startTime.addMinutes(-this.startTime.getTimezoneOffset()); //Vuil, maar anders lukte het niet... Mss later nog eens herbekijken
		var enrollment = new Enrollment({
			student: this.student,
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
				var errors = $.parseJSON(response.responseText).errors;
				if (errors.length == 0){alert('Systeemfout');}
				else {alert('Fout: ' + errors);}
			}});
	}
});
