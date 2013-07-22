var Schedule = Backbone.Collection.extend({
	//Always models the schedule of ONE day
	initialize: function() {
		this._meta = {};
	},
	model: Lesson,
	url: "/lessons",
	comparator: function(lesson){
		if (lesson){return lesson.get("startTime").getTime();}
	},
	meta: function(prop, value) {
		if (value === undefined) {
			return this._meta[prop];
		}
		else {
			this._meta[prop] = value;
		}
	}
});

var ScheduleView = Backbone.View.extend({
	initialize: function () {
	},
	events: {
		"click .teacherteaching": "showTeacherTeachingDropDown",
		"click .lesson": "showLessonDropDown",
		"click #navbackward": "navigateToPreviousWeek",
		"click #navforward": "navigateToNextWeek"
	},
	render: function() {
		var scheduleMatrix = this.buildScheduleMatrix();
		var renderedScheduleMatrix = "";
		var item;

		var cursorArray = [];
		var skippingSlotsCountDownArray = [];
		var scheduleViewItemTemplate = this.options.template;
		this.itemsArray = [];
		var itemsArrayIndex = 0;
		for (var i = 0; i < scheduleMatrix.length; i++) {
			cursorArray.push(0);
		};

		renderedScheduleMatrix = renderedScheduleMatrix.concat('<table id="lessenrooster" data-teacher-id= "' + this.collection.meta("teacher").get("id") + '">');
		//Eerst alle datums er voor zetten
		renderedScheduleMatrix = renderedScheduleMatrix.concat('<td class = "navbutton" id="navbackward">' + "Vorige" + '</td><td class = "navbutton" id="navforward">' + "Volgende" + '</td>');
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
					var colspan = 1;

					++cursorArray[j];
					if (scheduleViewItem.content.get("type") == "lesson") { // We hebben een les vast
						htmlClass = "lesson lesson-" + scheduleViewItem.content.get('status');
						if (scheduleViewItem.content.get('paid') == false) {htmlClass += " unpaidenrollment";}
						if (scheduleViewItem.content.get('approved') == false) {htmlClass += " unapprovedenrollment";}
						text = scheduleViewItem.content.getStudentName(); // + " " + scheduleViewItem.content.get("duration") + " minutes";
					}
					else { // We hebben iets vast dat geen les is: schoolopeningsuren, lesuren, ...
						htmlClass = scheduleViewItem.content.get("type");
						if (scheduleViewItem.content.has("text")) {
							text = scheduleViewItem.content.attributes.text;
							htmlClass = htmlClass + " ui-state-default";
						}
						if (scheduleViewItem.content.get("type") == "hour") {colspan = 2;}
					}
					this.itemsArray.push(scheduleViewItem);
					var html = Mustache.render(scheduleViewItemTemplate, {
						"htmlClass": htmlClass,
						"rowspan": rowspan,
						"startTime": scheduleViewItem.startTime.toString(),
						"duration": scheduleViewItem.duration,
						"text": text,
						"id": itemsArrayIndex,
						"colspan": colspan
					});
					itemsArrayIndex++;
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
		$(this.el).find('.navbutton').each(function() {$(this).button();});
	},
	buildScheduleMatrix: function() {
		var startDate = new Date(this.collection.meta("startDate"));
		var endDate = new Date(this.collection.meta("endDate"));
		var numberOfDays = (endDate.getTime() - startDate.getTime())/(1000*60*60*24) + 1;


		var schoolOpeningHours = this.getSchoolOpeningHours();
		var teacherTeachingHours = this.getTeacherTeachingHours();
		var numberOfSlots = this.getNumberOfSlots();

		//console.log("numberOfSlots = ", numberOfSlots);

		var scheduleMatrix = new ScheduleMatrix(startDate, numberOfDays, period.get('openingTimeHours'), period.get('openingTimeMinutes'), period.get('closingTimeHours'), period.get('closingTimeMinutes'));

		//Alle arrays erin gooien
		schoolOpeningHours.each(function(model) {scheduleMatrix.add(new ScheduleViewItem(model));});
		teacherTeachingHours.each(function(model) {scheduleMatrix.add(new ScheduleViewItem(model));});
		this.collection.each(function(model) {scheduleMatrix.add(new ScheduleViewItem(model));});
		scheduleMatrix.splitItemsIntoStandardLength("teacherteaching");

		//De "timeindications" er in gooien die zorgen dat die rowspan lukt
		var timeIndicationArray = new ScheduleViewItemArray();
		var tempDate = new Date(startDate);
		tempDate.setHours(period.get('openingTimeHours'));
		tempDate.setMinutes(period.get('openingTimeMinutes'));
		for (var i = 0; i < numberOfSlots; i++) {
			timeIndicationArray.push(new ScheduleViewItem(new TimeRange({"startTime": tempDate, "duration": smallestSlotLength, "type": "timeindication"})));
			tempDate.addMinutes(smallestSlotLength);
		};
		scheduleMatrix.push(timeIndicationArray); //op het einde van de schedulematrix gooien we de timeindicationarray

		//Uur aanduiding links maken
		var hoursArray = [];
		if (period.get('openingTimeMinutes') > 0) {
			hoursArray.push(new ScheduleViewItem(new TimeRange({"startTime": 0, "duration": period.get('openingTimeMinutes'), "type": "hour", "text": period.get('openingTimeHours') + " uur"})))
		}
		else {
			hoursArray.push(new ScheduleViewItem(new TimeRange({"startTime": 0, "duration": 60, "type": "hour", "text": period.get('openingTimeHours') + " uur"})));
		}

		for (var i = 1; i < period.get('closingTimeHours')-period.get('openingTimeHours')+2; i++) {
			var text = (period.get('openingTimeHours')+i) + " uur";
			hoursArray.push(new ScheduleViewItem(new TimeRange({"startTime": 0, "duration": 60, "type": "hour", "text": text})));
		};
		if (period.get('closingTimeMinutes') > 0) {
			hoursArray.push(new ScheduleViewItem(new TimeRange({"startTime": 0, "duration": period.get('closingTimeMinutes'), "type": "hour", "text": period.get('closingTimeHours') + " uur"})))
		};

		//hoursArray in schedulematrix gooien, op eerste plaats
		scheduleMatrix.unshift(hoursArray); 

		return scheduleMatrix;
	},
	getSchoolOpeningHours: function () {
		//testprocedure, should come from server
		//zaterdag em zondag geen les
		var startDate = new Date(this.collection.meta("startDate"));
		var endDate = new Date(this.collection.meta("endDate"));
		var resultingSchoolOpeningHours = new TimeRangeCollection();

		var numberOfDays = (endDate.getTime() - startDate.getTime())/(1000*60*60*24) + 1;
		var duration = (period.get('closingTimeHours')*60 + period.get('closingTimeMinutes') - period.get('openingTimeHours')*60 - period.get('openingTimeMinutes'))

		for (var i = 0; i < numberOfDays ; i++) {
			var schoolOpenDate = new Date(startDate);
			schoolOpenDate.add({days: i});
			schoolOpenDate.addHours(period.get('openingTimeHours'));
			schoolOpenDate.addMinutes(period.get('openingTimeMinutes'));
			if ((schoolOpenDate.is().monday() && period.get('openOnMonday') == true)
				|| (schoolOpenDate.is().tuesday() && period.get('openOnTuesday') == true)
				|| (schoolOpenDate.is().wednesday() && period.get('openOnWednesday') == true)
				|| (schoolOpenDate.is().thursday() && period.get('openOnThursday') == true)
				|| (schoolOpenDate.is().friday() && period.get('openOnFriday') == true)
				|| (schoolOpenDate.is().saturday() && period.get('openOnSaturday') == true)
				|| (schoolOpenDate.is().sunday() && period.get('openOnSunday') == true)) {
				resultingSchoolOpeningHours.add(new TimeRange({"startTime": schoolOpenDate, "duration" : duration, "type" : "schoolopen"}));
			}
		};

		//console.log("resultingSchoolOpeningHours = ", resultingSchoolOpeningHours);

		return resultingSchoolOpeningHours;
	},
	getTeacherTeachingHours: function () {
		//testprocedure, should come from server
		//zaterdag em zondag geen les
		var startDate = new Date(this.collection.meta("startDate"));
		var endDate = new Date(this.collection.meta("endDate"));
		var resultingTeacherTeachingHours = new TimeRangeCollection();

		var numberOfDays = (endDate.getTime() - startDate.getTime())/(1000*60*60*24) + 1;
		var teacher = this.collection.meta("teacher");
		//console.log("teacher = ", teacher);
		
		for (var i = 0; i < numberOfDays ; i++) {
			var teacherTeachingDate = new Date(startDate);
			var duration;
			var startTeachingHash;
			var endTeachingHash;
			var day;

			teacherTeachingDate.add({days: i});
			if (teacherTeachingDate.is().monday()) {day = "monday"}
			if (teacherTeachingDate.is().tuesday()) {day = "tuesday"}
			if (teacherTeachingDate.is().wednesday()){day = "wednesday"}
			if (teacherTeachingDate.is().thursday()) {day = "thursday"}
			if (teacherTeachingDate.is().friday()) {day = "friday"}
			if (teacherTeachingDate.is().saturday()) {day = "saturday"}
			if (teacherTeachingDate.is().sunday()) {day = "sunday"}

			startTeachingHash = teacher.getTeachingTimeHash('start',day);
			endTeachingHash = teacher.getTeachingTimeHash('end',day);
			teacherTeachingDate.addHours(startTeachingHash.hours);
			teacherTeachingDate.addMinutes(startTeachingHash.minutes);
			duration = endTeachingHash.hours*60 + endTeachingHash.minutes - startTeachingHash.hours*60 - startTeachingHash.minutes
			
			
			if (duration > 0) {
				resultingTeacherTeachingHours.add(new TimeRange({"startTime": teacherTeachingDate, "duration" : duration, "type" : "teacherteaching"}));
			}
		};

		//console.log("resultingTeacherTeachingHours = ", resultingTeacherTeachingHours);

		return resultingTeacherTeachingHours;
	},
	getNumberOfSlots: function(){
		// Returns the amount of slots between the minimum and maximum opening hours based on smallestSlotLength

		return (period.get('closingTimeHours')*60 + period.get('closingTimeMinutes') - period.get('openingTimeHours')*60 - period.get('openingTimeMinutes')) / smallestSlotLength;
	},
	showTeacherTeachingDropDown: function(event) {
		//console.log("$(e.currentTarget).data('starttime') = " + $(e.currentTarget).data("starttime"));
		//console.log("$(e.currentTarget).data('duration') = " + $(e.currentTarget).data('duration'));
		//console.log("event.pageX = " + event.pageX);
		//console.log("event.pageY = " + event.pageY);

		var scheduleViewItem = this.itemsArray[$(event.target).data('id')];

		//console.log("scheduleViewItem.startTime = " + scheduleViewItem.startTime);
		moderator.showTeacherTeachingDropDown(event.pageX, event.pageY, scheduleViewItem);
		//event.stopPropagation();//Anders wordt de dropdown direct terug weggegooid!
	},
	showLessonDropDown: function(event) {
		var scheduleViewItem = this.itemsArray[$(event.target).data('id')];

		moderator.showLessonDropDown(event.pageX, event.pageY, scheduleViewItem.content);
	},
	navigateToPreviousWeek: function(event){
		var startDate = this.collection.meta("startDate");
		startDate.addWeeks(-1);
		var endDate = this.collection.meta("endDate");
		endDate.addWeeks(-1);
		var teacher = this.collection.meta("teacher");
		moderator.setMainScreenTeacherSchedule(teacher, startDate, endDate);
	},
	navigateToNextWeek: function(event){
		var startDate = this.collection.meta("startDate");
		startDate.addWeeks(1);
		var endDate = this.collection.meta("endDate");
		endDate.addWeeks(1);
		var teacher = this.collection.meta("teacher");
		moderator.setMainScreenTeacherSchedule(teacher, startDate, endDate);
	}

})

function ScheduleViewItem(item) {
	//Item om in de scheduleview te steken. 
	this.duration = item.get("duration");
	this.startTime = item.get("startTime");
	this.content = item;
	if (item.has("teacher")) {
		item.set({type: "lesson"})
	}
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

function ScheduleMatrix(startDate, numberOfDays, openingTimeHours, openingTimeMinutes, closingTimeHours, closingTimeMinutes) {
	this.startDate = startDate;
	this.numberOfDays = numberOfDays;
	var duration = (period.get('closingTimeHours')*60 + period.get('closingTimeMinutes') - period.get('openingTimeHours')*60 - period.get('openingTimeMinutes'))
	// Elke dag één item inzetten van beginschooldag tot eindschooldag, met type = "schoolopen"
	for (var i = 0; i < numberOfDays; i++) {
		this.push(new ScheduleViewItemArray());
		var tempDate = new Date(startDate);
		tempDate.set({hour: period.get('openingTimeHours'), minute: period.get('openingTimeMinutes')});
		tempDate.addDays(i);
		this[i].push(new ScheduleViewItem(new TimeRange({"startTime": tempDate, "duration": duration,"type": "boundary"})));
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
			&& existingItem.getEndTime() > newScheduleViewItem.startTime.getTime()
			&& upperLevelOk(existingItem, newScheduleViewItem)) {
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
function upperLevelOk(existingItem, newItem) {
	var upperLevelOk = false;
	var existingItemType = existingItem.content.get("type");
	var newItemType = newItem.content.get("type");
	if (existingItemType == "boundary" && newItemType == "schoolopen"){upperLevelOk = true};
	if (existingItemType == "schoolopen" && newItemType == "teacherteaching"){upperLevelOk = true};
	if (existingItemType == "teacherteaching" && newItemType == "lesson"){upperLevelOk = true};

	return upperLevelOk;
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