var Schedule = Backbone.Collection.extend({
	//Always models the schedule of ONE day
	initialize: function() {
		this._meta = {};
	},
	model: Lesson,
	url: "/lessons",
	comparator: function(lesson){
		if (lesson){return lesson.get("startTime").getTime()}
	},
	meta: function(prop, value) {
		if (value === undefined) {
			return this._meta[prop]
		}
		else {
			this._meta[prop] = value;
		}
	},
	parse: function (response) {
		var resultArray = [];
		for (var i = 0; i < response.length; i++) {
			var data = response[i];
			var lesson = new Lesson({
				startTime: new Date(data.startTime),
				duration: data.duration,
				teacher: data.teacher_id,
				student: data.student_id,
				status: data.status
			});
			resultArray.push(lesson);
		};
		return resultArray;
	}
});

var ScheduleView = Backbone.View.extend({
	initialize: function () {
	},
	events: {
		"click .teacherteaching": "showTeacherTeachingDropdown",
	},
	render: function() {
		var scheduleMatrix = this.buildScheduleMatrix();
		var renderedScheduleMatrix = "";
		var item;

		var cursorArray = [];
		var skippingSlotsCountDownArray = [];
		var scheduleViewItemTemplate = this.options.template;
		for (var i = 0; i < scheduleMatrix.length; i++) {
			cursorArray.push(0);
		};

		renderedScheduleMatrix =  renderedScheduleMatrix.concat('<table id="lessenrooster" data-teacher-id= "' + this.collection.meta("teacher").get("id") + '">');
		//Eerst alle datums er voor zetten
		renderedScheduleMatrix = renderedScheduleMatrix.concat('<td class = "date">' + "" + '</td>');
		for (var i = 0; i < scheduleMatrix.length-2; i++) {
			var renderDate = new Date(this.collection.meta("startDate"));
			renderDate.add({days: i});
			renderedScheduleMatrix = renderedScheduleMatrix.concat('<td class = "date ui-state-default">' + renderDate.toString("ddd dd MMM yyyy") + '</td>');
		};

		// "horizontale" loop, maakt i aantal rijen aan, gebaseerd op de kolom die het meeste children heeft. Dit zal steeds de eerste kolom zijn.
		// i duidt de RIJ aan || Wordt eigenlijk vervangen door de cursorarray
		for (var i = 0; i < scheduleMatrix.getMaxLengthOfChildren(); i++) {
			renderedScheduleMatrix =  renderedScheduleMatrix.concat('<tr>');
			//"verticale" loop, loopt over aantal dagen
			// j is dus de index die de DAG aanduidt
			for (var j = 0; j < scheduleMatrix.length; j++) {
				//console.log("i = " + i);
				//console.log("j = " + j);
				if (skippingSlotsCountDownArray[j] > 1) {
						--skippingSlotsCountDownArray[j]; // Deze array is nodig om geen items in de volgende row te zetten als de vorige een rowspan > 1 heeft
					}
				else {
					// Cursorarray heeft evenveel elementen als dagen, en per dag staat er in aan welk item we zitten. Dit omdat we niet op index i kunnen vertrouwen omdat die veel harder itereert wegens de skipping/rowspan logica
					var scheduleViewItem = scheduleMatrix[j][cursorArray[j]];
					var rowspan = scheduleViewItem.getNumberOfSlots();
					var htmlClass = '';
					var text = ''; 

					++cursorArray[j];

					if (scheduleViewItem.content.has("type")) { // We hebben iets vast dat geen les is: schoolopeningsuren, lesuren, ...
						htmlClass = scheduleViewItem.content.get("type");
						if (scheduleViewItem.content.has("text")) {
							text = scheduleViewItem.content.attributes.text;
							htmlClass = htmlClass + " ui-state-default";
						}
					};
					if (scheduleViewItem.content.has("teacher")) { // We hebben een les vast
						htmlClass = "lesson lesson-" + scheduleViewItem.content.get('status');
						text = allStudents.get(scheduleViewItem.content.get("student")).get("name"); // + " " + scheduleViewItem.content.get("duration") + " minutes";
					};
					var html = Mustache.render(scheduleViewItemTemplate, {
						"htmlClass": htmlClass,
						"rowspan": rowspan,
						"startTime": scheduleViewItem.startTime.toString(),
						"duration": scheduleViewItem.duration,
						"text": text
					});
					renderedScheduleMatrix =  renderedScheduleMatrix.concat(html);	

					if (rowspan > 1) {
						skippingSlotsCountDownArray[j] = rowspan;
					};
				};	
			};
			renderedScheduleMatrix = renderedScheduleMatrix.concat('</tr>');
		};
		renderedScheduleMatrix = renderedScheduleMatrix.concat('</table>');
		$(this.el).html(renderedScheduleMatrix);
	},
	buildScheduleMatrix: function() {
		var startDate = new Date(this.collection.meta("startDate"));
		var endDate = new Date(this.collection.meta("endDate"));
		var numberOfDays = (endDate.getTime() - startDate.getTime())/(1000*60*60*24) + 1;


		var schoolOpeningHours = this.getSchoolOpeningHours();
		var teacherTeachingHours = this.getTeacherTeachingHours();
		var numberOfSlots = this.getNumberOfSlots(schoolOpeningHours);

		var scheduleMatrix = new ScheduleMatrix(startDate, numberOfDays);

		//Alle uren enzo erin gooien
		schoolOpeningHours.each(function(model) {scheduleMatrix.add(new ScheduleViewItem(model));});
		teacherTeachingHours.each(function(model) {scheduleMatrix.add(new ScheduleViewItem(model));});
		console.log("this.collection = " + this.collection);
		this.collection.each(function(model) {scheduleMatrix.add(new ScheduleViewItem(model));});
		scheduleMatrix.splitItemsIntoStandardLength("teacherteaching");

		//De "timeindications" er in gooien die zorgen dat die rowspn lukt
		var timeIndicationArray = new ScheduleViewItemArray();
		var tempDate = new Date(startDate);
		tempDate.setHours(schoolOpeningHours);
		for (var i = 0; i < numberOfSlots; i++) {
			timeIndicationArray.push(new ScheduleViewItem(new TimeRange({"startTime": tempDate, "duration": smallestSlotLength, "type": "timeindication"})));
			tempDate.addMinutes(smallestSlotLength);
		};
		scheduleMatrix.push(timeIndicationArray);

		var hoursArray = [];
		for (var i = 0; i < endSchoolDay-startSchoolDay+2; i++) {
			var text = (startSchoolDay+i) + " uur";
			hoursArray[i] = new ScheduleViewItem(new TimeRange({"startTime": 0, "duration": 60, "type": "hour", "text": text}));
		};

		scheduleMatrix.unshift(hoursArray);


		console.log("scheduleMatrix = ", scheduleMatrix);

		return scheduleMatrix;
	},
	getSchoolOpeningHours: function() {
		//testprocedure, should come from server
		//zondag gesloten
		//Formaat: startdate/enddate/startdate/enddate/...
		var startDate = new Date(this.collection.meta("startDate"));
		var endDate = new Date(this.collection.meta("endDate"));
		var resultingSchoolOpeningHours = new TimeRangeCollection();

		var numberOfDays = (endDate.getTime() - startDate.getTime())/(1000*60*60*24) +1;

		for (var i = 0; i <= numberOfDays-1 ; i++) {
			var openingStartDate = new Date(startDate);
			openingStartDate.add({days: i});
			openingStartDate.addHours(startSchoolDay);
			var duration = (endSchoolDay-startSchoolDay)*60;
			resultingSchoolOpeningHours.add(new TimeRange({"startTime": openingStartDate, "duration" : duration, "type" : "schoolopen"}));
		};

		return resultingSchoolOpeningHours;
	},
	getTeacherTeachingHours: function () {
		//testprocedure, should come from server
		//zaterdag em zondag geen les
		var startDate = new Date(this.collection.meta("startDate"));
		var endDate = new Date(this.collection.meta("endDate"));
		var resultingTeacherTeachingHours = new TimeRangeCollection();

		var numberOfDays = (endDate.getTime() - startDate.getTime())/(1000*60*60*24) + 1;

		for (var i = 0; i <= numberOfDays-3 ; i++) {
			var teachingStartDate = new Date(startDate);
			teachingStartDate.add({days: i});
			teachingStartDate.addHours(9);
			var duration = 4*60;
			resultingTeacherTeachingHours.add(new TimeRange({"startTime": teachingStartDate, "duration" : duration, "type" : "teacherteaching"}));

			teachingStartDate = new Date(startDate);
			teachingStartDate.add({days: i});
			teachingStartDate.addHours(14);
			duration = 2.5*60;
			resultingTeacherTeachingHours.add(new TimeRange({"startTime": teachingStartDate, "duration" : duration, "type" : "teacherteaching"}));

		};

		return resultingTeacherTeachingHours;
	},
	getNumberOfSlots: function(openingHours){
		// Returns the amount of slots between the minimum and maximum opening hours based on smallestSlotLength
		var result;

		result = ((endSchoolDay*60) - (startSchoolDay*60)) / smallestSlotLength;
		return result;
	},
	showTeacherTeachingDropdown: function(event) {
		//console.log("$(e.currentTarget).data('starttime') = " + $(e.currentTarget).data("starttime"));
		//console.log("$(e.currentTarget).data('duration') = " + $(e.currentTarget).data('duration'));
		//console.log("event.pageX = " + event.pageX);
		//console.log("event.pageY = " + event.pageY);

		var scheduleViewItem = new ScheduleViewItem(new TimeRange({ "startTime": new Date($(event.currentTarget).data("starttime")) , 
																	"duration": $(event.currentTarget).data('duration'), 
																	"type": $(event.currentTarget).attr("class")}));
		//console.log("scheduleViewItem.startTime = " + scheduleViewItem.startTime);
		moderator.showTeacherTeachingDropdown(event.pageX, event.pageY, scheduleViewItem);
		event.stopPropagation();//Anders wordt de dropdown direct terug weggegooid!
	}

})

function ScheduleViewItem(item) {
	//Item om in de scheduleview te steken. 
	this.duration = item.get("duration");
	this.startTime = item.get("startTime");
	this.content = item;
};
ScheduleViewItem.prototype.getRelativeDay = function(firstDay) {
	var tempDate = new Date(this.startTime);
	tempDate.clearTime();
	return (tempDate.getTime() - firstDay.getTime())/(1000*60*60*24);
};
ScheduleViewItem.prototype.getNumberOfSlots = function(){
	//Gebruikt om de rowspan te berekenen
	if (this.duration) {return this.duration/smallestSlotLength;}
	else {return 1};
	
};
ScheduleViewItem.prototype.getEndTime = function(){
	return this.startTime.getTime() + this.duration*60*1000;
};
ScheduleViewItem.prototype.setStartTime = function(startTime) {
	this.startTime = startTime;
	this.content.set({"startTime": startTime});
};
ScheduleViewItem.prototype.setDuration = function(duration) {
	this.duration = duration;
	this.content.set({"duration": duration});
};
ScheduleViewItem.prototype.getTimeOfDayInMinutes = function() {
	return (this.startTime.getHours()*60 + this.startTime.getMinutes());
};
function ScheduleViewText (type, text) {
	this.type = type;
	this.text = text;
};

function ScheduleMatrix(startDate, numberOfDays) {
	this.startDate = startDate;
	this.numberOfDays = numberOfDays;
	// Elke dag één item inzetten van beginschooldag tot eindschooldag, met type = "boundary"
	for (var i = 0; i < numberOfDays; i++) {
		this.push(new ScheduleViewItemArray());
		var tempDate = new Date(startDate);
		tempDate.set({hour: startSchoolDay});
		tempDate.addDays(i);
		this[i].push(new ScheduleViewItem(new TimeRange({"startTime": tempDate, "duration": (endSchoolDay - startSchoolDay)*60,"type": "boundary"})));
	};
	//console.log("this = " + this);
};
ScheduleMatrix.prototype = new Array();

ScheduleMatrix.prototype.add = function(scheduleViewItem) {
	// Soort van "portaalmethode", want achterliggend callen we de methode die per dag werkt
	var index = scheduleViewItem.getRelativeDay(this.startDate);
	this[index].addScheduleViewItem(scheduleViewItem);
};

ScheduleMatrix.prototype.getMaxLengthOfChildren = function() {
	var result;
	result = 0;
	for (var i = 0; i < this.length; i++) {
		if (this[i].length > result) {
			result = this[i].length;
		}
	};
	return result;
};
ScheduleMatrix.prototype.splitItemsIntoStandardLength = function(type){
	for (var i = 0; i < this.length; i++) {
		this[i].splitItemsIntoStandardLength(type);
	};
};

ScheduleViewItemArray.prototype = new Array();
ScheduleViewItemArray.prototype.constructor = ScheduleViewItemArray;
function ScheduleViewItemArray () {
	Array.call(this);
};
ScheduleViewItemArray.prototype.addScheduleViewItem = function(newScheduleViewItem) {
	for (var i = 0; i < this.length; i++) {
		var existingItem = this[i];
		if (existingItem.startTime.getTime() <= newScheduleViewItem.startTime.getTime()
			&& existingItem.getEndTime() > newScheduleViewItem.startTime.getTime()) {
				var originalItemEndTime = existingItem.getEndTime();
			 	existingItem.setDuration((newScheduleViewItem.startTime.getTime() - existingItem.startTime.getTime())/60000);
				this.splice(i+1, 0, newScheduleViewItem);
				if (originalItemEndTime == newScheduleViewItem.getEndTime()) {
					;
				}
				else {
					var tempTime = new Date(newScheduleViewItem.startTime);
					tempTime.add({minutes: newScheduleViewItem.duration});
					this.splice(i+2, 0, new ScheduleViewItem(new TimeRange({"startTime" : tempTime, "duration": (originalItemEndTime - newScheduleViewItem.getEndTime())/60000, "type": existingItem.content.get("type")})));
				};
				if  (existingItem.duration == 0) {
					this.splice(i, 1);
				}
				return;
			}
	};
};
ScheduleViewItemArray.prototype.splitItemsIntoStandardLength = function(type) {
	for (var i = 0; i < this.length; i++) {
		//Originele item wordt telkens "naar boven geduwd"
		var existingItem = this[i];
		if (existingItem.content.get("type") == type) {
			for (var j = 0; existingItem.duration > standardLessonLength; j++) {
				var modulo = existingItem.getTimeOfDayInMinutes()%standardLessonLength;
				var newDuration;
				if (modulo == 0) {newDuration = standardLessonLength} else {newDuration = modulo};
				var newStartTime = new Date(existingItem.startTime);
				this.splice(i+j,0,new ScheduleViewItem(new TimeRange({"startTime": newStartTime , "duration": newDuration, "type": existingItem.content.get("type")})));
				existingItem.duration = existingItem.duration - newDuration;
				existingItem.startTime.add({"minutes": newDuration});
			};

		}
	};
};
var TeacherTeachingDropDownView = Backbone.View.extend({
	initialize: function () {
		//this.attributes = {
			//"data-startTime": this.options.scheduleViewItem.startTime.toString(),
			//"data-duration": this.options.scheduleViewItem.duration
		//};
	},
	tagName: "ul",
	id: "dropDownMenu",
	events: {
		"click .enroll": "showEnrollmentDialog"
	},
	render: function() {
		$(this.el).remove();
		$("body").append(Mustache.render(this.options.template.html(),{
			"startTime": this.options.scheduleViewItem.startTime.toString(), 
			"duration": this.options.scheduleViewItem.duration
		})); //this.options.scheduleViewItem
		var dropDownMenu = $("#dropDownMenu");
		dropDownMenu.menu()
					.css({
						position: 'absolute',
						zIndex:   5000,
       					top:      this.options.posY, 
       					left:     this.options.posX
     				});
		dropDownMenu.outside('click', function(e){
			$(this).remove();
		});
		this.setElement(dropDownMenu);
		return this;
	},
	showEnrollmentDialog: function(e) {
		e.preventDefault();

		var student = "Simon Van Casteren";//var user = getUSER!!!
		var teacher = allTeachers.get($("#lessenrooster").data("teacher-id"));
		var startTime = $(e.currentTarget).parents("ul").data("starttime");
		var duration = $(e.currentTarget).parents("ul").data("duration");
		
		moderator.showEnrollmentDialog(student,teacher, startTime, duration);
	}
});
var EnrollmentDialogView = Backbone.View.extend({
	initialize: function () {
	},
	tagName: "div",
	id:"enrollmentDialog",
	events: {

	},
	render: function() {
		var startTimeObject = new Date(this.options.startTime);
		$("body").append(Mustache.render(
			this.options.template.html(),{
			"studentName": this.options.student, //aan te passen wanneer we echt student object meegeven
			"teacherName": this.options.teacher.get('name'),
			"teachingDay": startTimeObject.toString("ddd dd MMM yyyy"),
			"startLessonHour": startTimeObject.toString("HH:mm")
		}));
		var enrollmentDialog = $('#enrollmentDialog');
		console.log("enrollmentDialog = " + enrollmentDialog);
		enrollmentDialog.dialog({
			autoOpen: true,
			height: 400,
			width: 450,
			modal: true,
			buttons:{
				"Voer inschrijving in": function () {
					
				},
				Cancel: function() {
          			$( this ).dialog( "close" );
        		}
			},
			close: function() {
        		//allFields.val( "" ).removeClass( "ui-state-error" );
        		$('#enrollmentDialog').remove();
      		}
		});
		$('#enrollmentDialog').children('#spinner').spinner();
	}
})
