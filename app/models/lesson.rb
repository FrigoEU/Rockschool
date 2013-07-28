class Lesson < ActiveRecord::Base
  include ApplicationHelper

  	attr_accessible :endtime, :starttime, :status, :teacher_id, :lessongroup_id
  	attr_accessor :paid, :students, :maximum_number_of_students, :approved
  	has_one :teacher
  	belongs_to :lessongroup, :inverse_of => :lessons
  	validate :start_and_endtime
    validates :status, inclusion: { in: %w(open absentreq absentok absentnok done), message: "%{value} is geen correcte status voor een les" }

  	def start_and_endtime
  		@errors.add(:base, "Starttijd mag niet later zijn dan eindtijd") unless self.starttime < self.endtime
  		@errors.add(:base, "Start en eindtijd moeten op dezelfde dag zijn") unless self.starttime.yday == self.endtime.yday
  	end

  	def retrieve_virtual_attributes(authorized)
      lessongroup = self.lessongroup

      #maximum_number_of_students
      self.maximum_number_of_students = lessongroup.maximum_number_of_students

      if authorized
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
      end
  	end

    def as_json options=nil
      options ||= {}
      options[:methods] = ((options[:methods] || []) + [:paid, :approved, :students, :maximum_number_of_students])
      super options
    end
    def authorized?(user)
      if user.isAdmin
        true
      else 
        students = self.lessongroup.students
        if (user.isStudent && students.include?(Student.find(user.role_id)))
          true
        else
          false
        end
      end     
    end
    def adapt_status_to_authorization(authorized)
      if authorized == false
        self.status = nil
      end
    end
end
