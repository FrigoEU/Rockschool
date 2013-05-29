var Student = Backbone.Model.extend({
	initialize: function(){

	}
});
var Students = Backbone.Collection.extend({
	model: Student,
	url: "/students"
})

var StudentsIndexView = Backbone.View.extend({
	events: {
		"click .studentDetails" : "showStudentDetails",
		"click .addStudent": "showAddStudentScreen"
	},
	tagName: "div",
	id: "accordion",
	render: function() {
		$(this.el).html(Mustache.to_html(this.options.template,{students: this.collection.toJSON()})); 
		$(this.el).children("div#accordion").accordion({collapsible: true});
		return this;
	},
	showAddStudentScreen: function(e) {
		moderator.setMainScreenAddStudent();
	}

});

var AddStudentView = Backbone.View.extend({
	events: {
		//"click .submitButton": "submit"

	},
	tagName: "div",
	id: "addstudentview",
	render: function () {
		$(this.el).off('click');
		$(this.el).html(this.options.template.html());
		$(this.el).find("button.submitButton").button();
		$(this.el).on('click', ".submitButton" , this.submit);

		return this;
	},
	submit: function(e) {
		e.preventDefault();

		var studentName = $(this).parents('#newstudentform').find('input[name=name]').val();
		allStudents.create({
            name: studentName
        });

        moderator.setMainScreenStudentIndex();
	}
})
