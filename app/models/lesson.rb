class Lesson < ActiveRecord::Base
  attr_accessible :dateTime, :duration, :startTime, :status, :teacher_id, :student_id
  belongs_to :teacher
  belongs_to :student
end
