class Lesson < ActiveRecord::Base
  	attr_accessible :endtime, :starttime, :status, :teacher_id, :lessongroup_id
  	attr_accessor :paid, :students, :maximum_number_of_students
  	has_one :teacher
  	belongs_to :lessongroup, :inverse_of => :lessons
  	validate :start_and_endtime

  	def start_and_endtime
  		@errors.add(:base, "Starttime can not be later than endtime") unless self.starttime < self.endtime
  		@errors.add(:base, "Starttime and endtime should be on the same day") unless self.starttime.yday == self.endtime.yday
  	end
  	def retrieve_virtual_attributes
      lessongroup = self.lessongroup
      #students
  		self.students = lessongroup.students

      #paid
      enrollments = lessongroup.enrollments
      if enrollments.empty?
        self.paid = true
      elsif lessongroup.maximum_number_of_students == 1
        self.paid = enrollments.first.paid
      else
        self.paid = true
      end

      #maximum_number_of_students
      self.maximum_number_of_students = lessongroup.maximum_number_of_students
  	end
    def as_json options=nil
      options ||= {}
      options[:methods] = ((options[:methods] || []) + [:paid, :students, :maximum_number_of_students])
      super options
    end
end
