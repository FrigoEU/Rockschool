class Student < ActiveRecord::Base
  attr_accessible :name, :phone, :address1, :address2
  has_many :enrollments
end
