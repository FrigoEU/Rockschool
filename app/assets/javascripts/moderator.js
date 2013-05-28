var moderator = {

	setMainScreenTeacherIndex: function() {
		$("#mainpage").children().html("");

		if (allTeachers){
			this.showMainScreenTeacherIndex();
		}
		else {
			allTeachers = new Teachers();
			allTeachers.fetch({success: this.showMainScreenTeacherIndex});
		}
	},
	showMainScreenTeacherIndex: function() {
		var teachersIndexView = new TeachersIndexView({
			collection: allTeachers,
			template: $("#teachersIndexViewTemplate").html(), 
			el: $('#sidebar')
		});
		teachersIndexView.render();
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
			if (Date.today().is().monday()) {
				firstDateForServer = Date.today();
			}
			else{
				firstDateForServer = Date.today().last().monday();//Date.parse('last monday');
			};

			if (Date.today().is().sunday()) {
				lastDateForServer = Date.today();
			}
			else{
				lastDateForServer = Date.today().next().sunday(); //Date.parse('next sunday');
			};
		} 

		console.log("firstDateForServer = " + firstDateForServer);
		console.log("lastDateForServer = " + lastDateForServer);
		teacher.showSchedule(firstDateForServer, lastDateForServer);
	},
	showMainScreenTeacherSchedule: function(schedule){
		var scheduleView = new ScheduleView({
			collection: schedule,
			el: $('#middle'),
			template: $("#scheduleViewItemTemplate").html()
		});
		scheduleView.render();
	},
	setMainScreenAddTeacher: function() {
		var addTeacherView = new AddTeacherView({
			template: $("#addTeacherTemplate"),
			el: $('#middle')
		});
		addTeacherView.render();
	},
	setMainScreenStudentIndex: function() {
		$("#mainpage").children().html("");

		if (allStudents){
			this.showMainScreenStudentIndex();
		}
		else {
			allStudents = new Students();
			allStudents.fetch({success: this.showMainScreenStudentIndex});
		};	
	},
	showMainScreenStudentIndex: function() {
		var studentsIndexView = new StudentsIndexView({
			collection: allStudents,
			template: $("#studentsIndexViewTemplate").html(), 
			el: $('#sidebar')
		});
		studentsIndexView.render();
	},
	setMainScreenAddStudent: function() {
		var addStudentView = new AddStudentView({
			template: $("#addStudentTemplate"),
			el: $('#middle')
		});
		addStudentView.render();
	},
	showTeacherTeachingDropdown: function(x,y,scheduleViewItem) {
		var teacherTeachingDropDownView = new TeacherTeachingDropDownView({
			posX: x,
			posY: y,
			scheduleViewItem: scheduleViewItem,
			template: $("#teacherTeachingDropDownTemplate"),
			el: $("#dropDownMenu"),
			attributes: {
				"startTime": scheduleViewItem.startTime.toString(),
				"duration": scheduleViewItem.duration
			}
		});
		teacherTeachingDropDownView.render();
	}
}