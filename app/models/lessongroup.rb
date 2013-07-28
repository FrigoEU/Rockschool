require 'active_support/core_ext'
require 'date'
include ApplicationHelper

class Lessongroup < ActiveRecord::Base
	attr_accessible :maximum_number_of_students
	has_many :lessons, autosave: true, :inverse_of => :lessongroup
	has_many :enrollments, :dependent => :destroy
	has_many :students, through: :enrollments
	validate :lessonerrors 
	validate :enrollment_restrictions
	accepts_nested_attributes_for :lessons

	def initialize(args)
		#logger.debug(args)
		unless argumentok?(args,:duration) && argumentok?(args,:starttime) && argumentok?(args,:teacher) && argumentok?(args,:maximum_number_of_students) && argumentok?(args,:type)  
			raise ArgumentError, "Missing arguments to create a new lessongroup"
		end
		unless args[:type] == "schoolyear" || args[:type] == "tenlessons"
			raise ArgumentError, "Incorrect type specified to lessongroup"
		end
		super({maximum_number_of_students: args[:maximum_number_of_students]})

		#@maximum_number_of_students = args[:maximum_number_of_students]
		@starttime = args[:starttime]
		@duration = args[:duration]
		@teacher = args[:teacher]
		@type = args[:type]
		@teacher_id = args[:teacher]

		self.planlessons
	end

	def planlessons()
		@weekday = @starttime.wday
		@lessontimehours = @starttime.hour
		@lessontimeminutes = @starttime.min
		@period = Period.where("startdate <= :date  AND enddate >= :date AND active = :active", {date: @starttime.to_date, active: true}).first
			raise ArgumentError, "Could not find period for Lessonplanner" if @period.nil?

		case @type
		when "schoolyear"
			activedate = @period.startdate
			amount_of_lessons = 30
		when "tenlessons"
			activedate = @starttime.to_date
			amount_of_lessons = 10
		end

		begin
			lesson = plan_first_free_lesson_from_date(activedate, @weekday, @lessontimehours, @lessontimeminutes)
			if lesson.nil?
				return nil
			else 
				activedate = lesson.starttime.to_date + 1.week
			end
		end while self.lessons.length < amount_of_lessons
	end

	def plan_first_free_lesson_from_date(date, day, hour, minute)
		#returns NIL if lesson slot is not open. Looks for next weeks if closing days. Returns NIL if out of period
		raise ArgumentError, "incorrect date argument in Lessonplanner" unless date.kind_of? Date
		raise ArgumentError, "incorrect day argument in Lessonplanner" unless day.kind_of? Integer 
		raise ArgumentError, "incorrect hour argument in Lessonplanner" unless hour.kind_of? Integer 
		raise ArgumentError, "incorrect minute argument in Lessonplanner" unless minute.kind_of? Integer 

		#eerst dag van de week zoeken
		dayofweekfound = false
		attemptedschedulingdate = date 
		begin
			if attemptedschedulingdate.wday == day 
				dayofweekfound = true
			else attemptedschedulingdate = attemptedschedulingdate + 1.day
			end
		end while dayofweekfound == false

		openslotfound = false
		begin
			if slot_has_lesson?(attemptedschedulingdate, hour, minute, @duration, @teacher) 
				return nil
			end
			if out_of_period?(attemptedschedulingdate) 
				return nil
			end
			if date_is_closed?(attemptedschedulingdate) 
				attemptedschedulingdate = attemptedschedulingdate + 1.week
			else
				openslotfound = true
			end
		end while not openslotfound

		if openslotfound 
			starttime = attemptedschedulingdate + hour.hours + minute.minutes
			endtime = attemptedschedulingdate + hour.hours + minute.minutes + @duration.minutes
			self.lessons.build({
				starttime: starttime, 
				endtime: endtime,
				status: "open",
				teacher_id: @teacher.id
			})
		end
	end
	def slot_has_lesson?(date, hour, minute, duration, teacher)
		logger.debug("minute:")
		logger.debug(minute)

		starttimenew = date + hour.hours + minute.minutes
		endtimenew = date + hour.hours + minute.minutes + duration.minutes
		lesson = Lesson.where("teacher_id = :teacher_id AND 
										(starttime = :starttimenew OR 
										(starttime < :starttimenew AND endtime > :starttimenew) OR
										(starttime > :starttimenew AND starttime < :endtimenew))",
										{teacher_id: teacher.id, 
										starttimenew: starttimenew,
										endtimenew: endtimenew}).first
		if lesson
			@errorlesson = lesson
			true
		else 
			false
		end
	end

	def date_is_closed?(date)
		Closingperiod.where("startdate <= :date AND enddate >= :date",{date: date}).first
	end

	def out_of_period?(date) 
		if date < @period.startdate || date > @period.enddate
			@errorperiod = true
			true
		end
	end

	def get_lessons()
		lessons = self.lessons
	end
	def make_lesson_at_the_end
		lastlesson = self.lessons.last
		@teacher = Teacher.find(lastlesson.teacher_id)
		@duration = lastlesson.endtime.hour*60 + lastlesson.endtime.min - lastlesson.starttime.hour*60 - lastlesson.starttime.min
		@period = Period.where("startdate <= :date  AND enddate >= :date AND active = :active", {date: lastlesson.starttime.to_date, active: true}).first
			raise ArgumentError, "Could not find period for Lessonplanner" if @period.nil?

		plan_first_free_lesson_from_date(lastlesson.starttime.to_date + 1.week, lastlesson.starttime.wday, lastlesson.starttime.hour, lastlesson.starttime.min)
	end

	private
	def lessonerrors
    	@errors.add(:base, "Les niet vrij op: " + date_to_be_format(@errorlesson.starttime.to_date)) unless @errorlesson.blank?
    	@errors.add(:base, "Les valt buiten schooljaar") if @errorperiod == true
  	end
  	def enrollment_restrictions
  		myEnrollments = self.enrollments
  		myStudentids = myEnrollments.map(&:student_id)
  		
  		@errors.add(:base, "Maximum aantal studenten overschreden, maximum " + self.maximum_number_of_students.to_s + " student(en).") if myEnrollments.size > self.maximum_number_of_students
  		@errors.add(:base, "Deze student is reeds ingeschreven.") if myStudentids.size != myStudentids.uniq.size
  	end
  	def date_to_be_format(date)
  		string = date.to_s;
  		string[8..9] +"/"+ string[5..6] +"/"+ string[0..3]
  	end
end