class Lesson < ActiveRecord::Base
  include ApplicationHelper

  	attr_accessible :endtime, :starttime, :status, :teacher_id, :lessongroup_id
  	attr_accessor :paid, :students, :maximum_number_of_students, :approved, :enrollment_id
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
        logger.debug(enrollments.count)

        if enrollments.empty?
          #we geven waarschuwingen als er niet betaald is of niet approved, dus als er nog geen inschrijvingen zien willen we nog niemand lastig vallen met waarschuwingen
          self.paid = true
          self.approved = true
        elsif lessongroup.maximum_number_of_students == 1
          # logger.debug(enrollments.first.paid?)
          self.paid = enrollments.first.paid?
          self.approved = enrollments.first.approved
        else
          self.paid = true
          self.approved = true
        end
      end

      #enrollment_id
      if enrollments.count == 1
        self.enrollment_id = enrollments.first.id
      end
  	end

    def as_json options=nil
      options ||= {}
      options[:methods] = ((options[:methods] || []) + [:paid, :approved, :students, :maximum_number_of_students, :enrollment_id])
      super options
    end
    def authorized?(user)
      if user.isAdmin
        true
      else 
        students = self.lessongroup.students
        user_id_in_students = false
        students.each do |student|
          if student.user_id = user.id 
            user_id_in_students = true
          end
        end
        if (user.isStudent && user_id_in_students)
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
