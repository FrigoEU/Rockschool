var moderator = {
	sidebarView: "",
	middleView: "",
	teachersIndexView: "",
	optionsView: "",
	scheduleView: "",
	teacherDetailsView: "",
	studentsIndexView: "",
	editStudentView: "",
	showStudentView:"",
	enrollmentDialogView: "",
	periodOptionsView: "",
	closingPeriodsOptionsView: "",
	lessonsSearchView: "",
	enrollmentsSearchView: "",
	loginView: "",
	DIALOGS: {
		enrollmentDialog: {view: 'enrollmentDialogView', template: '#enrollmentDialogTemplate', el: '#enrollmentDialog', class: 'EnrollmentDialogView'},
		newlessongroupDialog: {view: 'newLessongroupView', template: '#newLessongroupTemplate', el: '#newLessongroupDialog', class: 'NewLessongroupDialogView'},
		grouplessonDetailsDialog: {view: 'grouplessonDetailsDialog', template: '#grouplessonDetailsDialogTemplate', el: '#grouplessonDetailsDialog', class: 'GrouplessonDetailsDialog'},
		generalDialog: {view: 'generalDialog', template: '#generalDialogTemplate', el: '#generalDialog', class: 'GeneralDialog'},
		passwordDialog: {view: 'passwordDialog', template: '#passwordDialogTemplate', el: '#passwordDialog', class: 'PasswordDialog'}
	},

	showMainScreenTeacherIndex: function() {
		if (this.teachersIndexView==="") {
			this.teachersIndexView = new TeachersIndexView({
				collection: allTeachers,
				template: $("#teachersIndexViewTemplate").html()
			});
		}
		this.setSidebar(this.teachersIndexView);
	},
	setMainScreenOptions: function() {
		if (this.optionsView===""){
			this.optionsView = new OptionsView({
				template: $("#optionsTemplate").html()
			});
		}
		this.setSidebar(this.optionsView);
	},
	showPeriodOptions: function() {
		if(this.periodOptionsView==="") {
			periodOptionsView = new PeriodOptionsView({
				template: $("#periodOptionsTemplate").html()
			});
		}
		this.setMiddle(periodOptionsView);
	},
	showClosingPeriodsOptions: function() {
		if(this.closingPeriodsOptionsView==="") {
			closingPeriodsOptionsView = new ClosingPeriodsOptionsView({
				template: $("#closingPeriodsOptionsTemplate").html()
			});
		}
		this.setMiddle(closingPeriodsOptionsView);
	},

	setMainScreenLogin: function() {
		if (this.loginView ===""){
			loginView = new LoginView({
				template: $('#loginViewTemplate').html()
			})
		}
		this.setMiddle(loginView);
	},
	showLessonsSearch: function() {
		if(this.lessonsSearchView==="") {
			lessonsSearchView = new LessonsSearchView({
				template: $("#lessonsSearchTemplate"),
				collection: new Lessons()
			});
		}
		else {
			this.lessonsSearchView.collection = new Lessons();
		}
		this.setMiddle(lessonsSearchView);
	},
	showEnrollmentsSearch: function(){
		if(this.enrollmentsSearchView==="") {
			enrollmentsSearchView = new EnrollmentsSearchView({
				template: $("#enrollmentsSearchTemplate"),
				collection: new Enrollments()
			});
		}
		else {
			this.enrollmentsSearchView.collection = new Enrollments();
		}
		this.setMiddle(enrollmentsSearchView);
	},
	setMainScreenTeacherSchedule: function (teacher, date1, date2) {
		var firstDateForServer;
		var lastDateForServer;
		if (date1 && date2) {
			firstDateForServer = date1;
			lastDateForServer = date2;
		}
		else {
			//eerste en laatste dag van deze week
			if (Date.today().is().monday()) {firstDateForServer = Date.today();}
			else{firstDateForServer = Date.today().last().monday();}

			if (Date.today().is().sunday()) {lastDateForServer = Date.today();}
			else{lastDateForServer = Date.today().next().sunday();}
		}

		//console.log("firstDateForServer = " + firstDateForServer);
		//console.log("lastDateForServer = " + lastDateForServer);
		teacher.showSchedule(firstDateForServer, lastDateForServer);
	},
	addLessonToActiveSchedule:function(lesson) {
		if (this.middleView == this.scheduleView){
			var schedule = this.scheduleView.collection;
			if (schedule.meta("startDate") < lesson.startTime && schedule.meta("endDate") > lesson.startTime){
				this.scheduleView.collection.add(lesson);
			}
		}
	},
	reloadMainscreen: function() {
		if (this.middleView != "") {
			this.middleView.render();
		}
	},
	reloadSidebar: function() {
		if (this.sidebarView != "") {
			this.sidebarView.render();
		}
	},
	showMainScreenTeacherSchedule: function(schedule){
		if (this.scheduleView==="") {
			this.scheduleView = new ScheduleView({
			collection: schedule,
			template: $("#scheduleViewItemTemplate").html()
			});
		}
		else {
			this.scheduleView.collection = schedule;
		}
		this.setMiddle(this.scheduleView);
	},
	setMainScreenAddTeacher: function() {
		if (this.teacherDetailsView==="") {
			this.teacherDetailsView = new TeacherDetailsView({
			template: $("#teacherDetailsTemplate")
			});
		}
		this.setMiddle(this.teacherDetailsView);
	},
	showMainScreenStudentIndex: function() {
		if (this.studentsIndexView==="") {
			this.studentsIndexView = new StudentsIndexView({
			collection: allStudents,
			template: $("#studentsIndexViewTemplate").html()
			});
		}
		this.setSidebar(this.studentsIndexView);
	},
	setMainScreenEditStudent: function(student) {
		if (this.editStudentView==="") {
			this.editStudentView = new EditStudentView({
			template: $("#editStudentTemplate")
			});
		}
		this.editStudentView.student = undefined;
		if (student !== undefined){
			this.editStudentView.student = student;
		}
		this.setMiddle(this.editStudentView);
	},
	setMainScreenShowStudent: function(student){
		if (this.showStudentView==="") {
			this.showStudentView = new ShowStudentView({
			template: $("#showStudentTemplate")
			});
		}
		this.showStudentView.student = undefined;
		if (student !== undefined){
			this.showStudentView.student = student;
		}
		this.setMiddle(this.showStudentView);
	},
	showTeacherTeachingDropDown: function(x,y,scheduleViewItem) {
		var teacherTeachingDropDownView = new TeacherTeachingDropDownView({
			posX: x,
			posY: y,
			scheduleViewItem: scheduleViewItem
		});
		teacherTeachingDropDownView.render();
	},
	showLessonDropDown: function(x,y,lesson) {
		var lessonDropDownView = new LessonDropDownView({
			posX: x,
			posY: y,
			lesson: lesson
		});
		lessonDropDownView.render();
	},
	showEnrollmentDropDown: function(x,y,enrollment,originatingView){
		var enrollmentDropDownView = new EnrollmentDropDownView({
			posX: x,
			posY: y,
			enrollment: enrollment,
			originatingView: originatingView
		});
		enrollmentDropDownView.render();
	},
	showDialog: function(dialog, options){
		var dialogView = this.DIALOGS[dialog].view;
		var dialogTemplate = this.DIALOGS[dialog].template;
		var dialogElement = this.DIALOGS[dialog].el;
		var myClass = window[this.DIALOGS[dialog].class];

		if (!this[dialogView]) {
			this[dialogView] = new myClass({
				template: $(dialogTemplate),
				el: $(dialogElement)});
		}
		_.each(options, function(value, key, list) {
			this[dialogView][key] = value;
		}, this);
		this[dialogView].render();
	},
	clearAllScreens: function () {
		if (this.sidebarView!==""){
			this.sidebarView.remove();
			$('#sidebar').remove();
			this.sidebarView="";
			$('#middle').before('<div id="sidebar"></div>');
		}
		this.clearMiddleScreen();
	},
	clearMiddleScreen: function () {
		if (this.middleView!=="") {
			this.middleView.remove();
			$('#middle').remove();
			this.middleView="";
			$('#sidebar').before('<div id="middle"></div>');
		}
	},
	setSidebar: function(view) {
		this.clearAllScreens();
		view.setElement($('#sidebar'));
		this.sidebarView = view;
		view.render();
	},
	setMiddle: function(view) {
		this.clearMiddleScreen();
		view.setElement($('#middle'));
		this.middleView = view;
		view.render();
	}
};