class Student < ActiveRecord::Base
  	attr_accessible :firstname, :lastname, :phone, :address1, :address2, :user_id
  	attr_accessor :email, :new_user
  	has_many :enrollments
  	belongs_to :user, :dependent => :destroy

  	def retrieve_virtual_attributes
		self.email = self.user.email
	end
	def as_json options=nil
      options ||= {}
      options[:methods] = ((options[:methods] || []) + [:email, :new_user])
      super options
    end
end
