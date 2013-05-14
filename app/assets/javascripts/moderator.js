var moderator = {

	setMainScreenTeacherIndex: function() {
		$("#mainpage").children().html("");

		if (allTeachers){
		}
		else {
			allTeachers = new Teachers();
			allTeachers.fetch({async: false});
		}

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
		var teacherSchedule = teacher.getSchedule(firstDateForServer, lastDateForServer);

		var scheduleView = new ScheduleView({
			collection: teacherSchedule,
			el: $('#middle'),
			template: $("#scheduleViewItemTemplate").html()
		});
		scheduleView.render();


		//make view for teacher.schedule(week) and render

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
		}
		else {
			allStudents = new Students();
			allStudents.fetch({async: false});
		};

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