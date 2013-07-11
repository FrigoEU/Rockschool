class Lesson < ActiveRecord::Base
  	attr_accessible :endtime, :starttime, :status, :teacher_id, :lessongroup_id
  	attr_accessor :paid, :students, :maximum_number_of_students, :approved
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

      #paid & approved
      enrollments = lessongroup.enrollments
      if enrollments.empty?
        #we geven waarschuwingen als er niet betaald is of niet approved, dus als er nog geen inschrijvingen zien willen we nog niemand lastig vallen met waarschuwingen
        self.paid = true
        self.approved = true
      elsif lessongroup.maximum_number_of_students == 1
        self.paid = enrollments.first.paid
        self.approved = enrollments.first.approved
      else
        self.paid = true
        self.approved = true
      end

      #maximum_number_of_students
      self.maximum_number_of_students = lessongroup.maximum_number_of_students
  	end
    def as_json options=nil
      options ||= {}
      options[:methods] = ((options[:methods] || []) + [:paid, :approved, :students, :maximum_number_of_students])
      super options
    end
end
