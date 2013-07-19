var Lessongroup = Backbone.Model.extend({
	url: "lessongroups"
});
var NewLessongroupDialogView = Backbone.View.extend({
	initialize:function() {
		_.bindAll(this);
	},
	events: {

	},
	tagName: "div",
	id:"newLessongroupDialog",
	render: function() {
		$("body").append(Mustache.render(
			this.options.template.html(),{
			"teacherName": this.teacher.get('name'),
			"teachingDay": this.startTime.toString("ddd dd MMM yyyy"),
			"startLessonHour": this.startTime.toString("HH:mm")
		}));
		var newLessongroupDialog = $('#'+this.id);
		this.setElement(newLessongroupDialog);
		//console.log("enrollmentDialog = " + enrollmentDialog);

		newLessongroupDialog.dialog({
			autoOpen: true,
			height: 300,
			width: 450,
			modal: true,
			buttons:{
					"Maak nieuwe groepsles": this.makeLessongroup,
					Cancel: function() {
								$( this ).dialog( "close" );
						}
				},
				close: function() {
						//allFields.val( "" ).removeClass( "ui-state-error" );
						$('#newLessongroupDialog').remove();
				}
		});
	},
	makeLessongroup: function (){
		var duration = $('#duration');
		var lessongroup = new Lessongroup({
			teacher: this.teacher,
			startTime: this.startTime,
			duration: $(this.el).find('#duration').val(),
			maxNumberOfStudents: $(this.el).find('#maxNumberOfStudents').val(),
			type: "schoolyear" //assumptie!
		});
		lessongroup.save(null, {
			success: function(model, response, options){
				$('#newLessongroupDialog').remove();
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
var GrouplessonDetailsDialog = Backbone.View.extend({
	id: "grouplessonDetailsDialog",

	render: function() {
		// var mappedEnrollments = _.map(this.collection.models, function(value, key, list){
		// 	return {
		// 		studentName: allStudents.get(value.student_id).get("name"),
		// 		paid: value.paid,
		// 		approved: value.approved
		// 	}
		// })
		$("body").append(Mustache.render(
			this.options.template.html(),{
			"teacherName": this.teacher.get('name'),
			"teachingDay": this.startTime.toString("ddd dd MMM yyyy"),
			"startLessonHour": this.startTime.toString("HH:mm"),
			"maximumNumberOfStudents": this.maximumNumberOfStudents,
			"duration": this.duration
		}));
		this.setElement($('#' + this.id));
		var enrollmentsDiv = $(this.el).find('#enrollments');
		_.each(this.collection.models, function(value, key, list){
			var singleEnrollmentDiv = $('<div></div>');
			enrollmentsDiv.append(singleEnrollmentDiv);
			var enrollmentBox = new EnrollmentBoxView({
				enrollment: value,
				el: singleEnrollmentDiv
			});
			enrollmentBox.render();
		});
		
		var grouplessonDetailsDialog = $('#'+this.id);
		this.setElement(grouplessonDetailsDialog);
		grouplessonDetailsDialog.dialog({
			autoOpen: true,
			height: 500,
			width: 450,
			modal: true,
			buttons:{
				Cancel: function() {
							$( this ).dialog( "close" );
					}
			},
			close: function() {
					//allFields.val( "" ).removeClass( "ui-state-error" );
					$('#grouplessonDetailsDialog').remove();
			}
		});
	},
})