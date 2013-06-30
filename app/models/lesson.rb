class Lesson < ActiveRecord::Base
  	attr_accessible :endtime, :starttime, :status, :teacher_id, :lessongroup_id
  	has_one :teacher
  	belongs_to :lessongroup, :inverse_of => :lessons
  	validate :start_and_endtime

  	def start_and_endtime
  		@errors.add(:base, "Starttime can not be later than endtime") unless self.starttime < self.endtime
  		@errors.add(:base, "Starttime and endtime should be on the same day") unless self.starttime.yday == self.endtime.yday
  	end
end
