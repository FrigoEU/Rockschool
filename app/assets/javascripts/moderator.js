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
	teacherShowDetailsView: "",
	DIALOGS: {
		enrollmentDialog: {view: 'enrollmentDialogView', template: '#enrollmentDialogTemplate', el: '#enrollmentDialog', class: 'EnrollmentDialogView'},
		newlessongroupDialog: {view: 'newLessongroupView', template: '#newLessongroupTemplate', el: '#newLessongroupDialog', class: 'NewLessongroupDialogView'},
		grouplessonDetailsDialog: {view: 'grouplessonDetailsDialog', template: '#grouplessonDetailsDialogTemplate', el: '#grouplessonDetailsDialog', class: 'GrouplessonDetailsDialog'},
		generalDialog: {view: 'generalDialog', template: '#generalDialogTemplate', el: '#generalDialog', class: 'GeneralDialog'},
		passwordDialog: {view: 'passwordDialog', template: '#passwordDialogTemplate', el: '#passwordDialog', class: 'PasswordDialog'},
		newLessonDialog: {view: 'newLessonDialog', template: '#newLessonDialogTemplate', el: '#newLessonDialog', class: 'NewLessonDialog'},
		passwordConfirmationDialog: {view: 'passwordConfirmationDialog', template: '#passwordConfirmationDialogTemplate', el: '#passwordConfirmationDialog', class: 'PasswordConfirmationDialog'}
	},

	showMainScreenTeacherIndex: function() {
		if (this.teachersIndexView==="") {
			this.teachersIndexView = new TeachersIndexView({
				template: $("#teachersIndexViewTemplate").html()
			});
		}
		this.teachersIndexView.collection = allTeachers;
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
			var periodStartDate = new Date(period.get('beginDate'));
			var scheduleDate;

			if (Date.today().compareTo(periodStartDate) == 1){scheduleDate = Date.today();}
			else {scheduleDate = periodStartDate;}

			if (scheduleDate.is().monday()) {firstDateForServer = scheduleDate;}
			else{firstDateForServer = (new Date(scheduleDate)).last().monday();}

			if (scheduleDate.is().sunday()) {lastDateForServer = scheduleDate;}
			else{lastDateForServer = (new Date(scheduleDate)).next().sunday();}	
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
		this.teacherDetailsView.teacher = undefined;
		this.setMiddle(this.teacherDetailsView);
	},
	setMainScreenEditTeacher: function(teacher) {
		if (this.teacherDetailsView==="") {
			this.teacherDetailsView = new TeacherDetailsView({
			template: $("#teacherDetailsTemplate")
			});
		}
		this.teacherDetailsView.teacher = teacher;
		this.setMiddle(this.teacherDetailsView);
	},
	setMainScreenShowTeacherDetails: function(teacher){
		if (this.teacherShowDetailsView==="") {
			this.teacherShowDetailsView = new TeacherShowDetailsView({
			template: $("#showTeacherDetailsTemplate")
			});
		}
		this.teacherShowDetailsView.teacher = teacher;
		this.setMiddle(this.teacherShowDetailsView);
		
	},
	showMainScreenStudentIndex: function() {
		if (this.studentsIndexView==="") {
			this.studentsIndexView = new StudentsIndexView({
			template: $("#studentsIndexViewTemplate").html()
			});
		}
		this.studentsIndexView.collection = allStudents;
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

		this[dialogView] = new myClass({
			template: $(dialogTemplate),
			el: $(dialogElement)});
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
	reloadMainscreen: function() {
		if (this.middleView != "") {
			this.middleView.render();
			$('#middle').mCustomScrollbar();
		}
	},
	reloadSidebar: function() {
		if (this.sidebarView != "") {
			this.sidebarView.render();
			$('#sidebar').mCustomScrollbar();
		}
	},
	setSidebar: function(view) {
		this.clearAllScreens();
		view.setElement($('#sidebar'));
		this.sidebarView = view;
		view.render();
		$('#sidebar').mCustomScrollbar();
	},
	setMiddle: function(view) {
		this.clearMiddleScreen();
		view.setElement($('#middle'));
		this.middleView = view;
		view.render();
		$('#middle').mCustomScrollbar();
	}
};