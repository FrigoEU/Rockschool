class Lesson < ActiveRecord::Base
  attr_accessible :duration, :starttime, :status, :teacher_id
  belongs_to :teacher
  belongs_to :lessongroup
end
