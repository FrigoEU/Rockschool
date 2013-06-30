var moderator = {
	sidebarView: "",
	middleView: "",
	teachersIndexView: "",
	optionsView: "",
	scheduleView: "",
	teacherDetailsView: "",
	studentsIndexView: "",
	addStudentView: "",
	enrollmentDialogView: "",
	periodOptionsView: "",

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
		this.middleView.render();
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
		this.teacherDetailsView.model = (new Teacher());
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
	setMainScreenAddStudent: function() {
		if (this.addStudentView==="") {
			this.addStudentView = new AddStudentView({
			template: $("#addStudentTemplate")
			});
		}
		this.setMiddle(this.addStudentView);
	},
	showTeacherTeachingDropDown: function(x,y,scheduleViewItem) {
		teacherTeachingDropDownView = new TeacherTeachingDropDownView({
			posX: x,
			posY: y,
			scheduleViewItem: scheduleViewItem
		});
		teacherTeachingDropDownView.render();
	},
	showLessonDropDown: function(x,y,scheduleViewItem) {
		lessonDropDownView = new LessonDropDownView({
			posX: x,
			posY: y,
			lesson: scheduleViewItem.content
		});
		lessonDropDownView.render();
	},
	showEnrollmentDialog: function(student, teacher, startTime, duration) {
		if (this.enrollmentDialogView==="") {
			this.enrollmentDialogView = new EnrollmentDialogView({
				template: $('#enrollmentDialogTemplate'),
				el:$("enrollmentDialog")
				});
		}
		this.enrollmentDialogView.student = student;
		this.enrollmentDialogView.teacher = teacher;
		this.enrollmentDialogView.startTime = startTime; //Zowel uur als dag!
		this.enrollmentDialogView.duration = duration;
		this.enrollmentDialogView.render();
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