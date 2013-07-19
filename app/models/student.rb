class Student < ActiveRecord::Base
  attr_accessible :firstname, :lastname, :phone, :address1, :address2
  has_many :enrollments
end
