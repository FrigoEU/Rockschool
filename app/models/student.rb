class Student < ActiveRecord::Base
  	attr_accessible :firstname, :lastname, :phone, :address1, :address2, :user_id
  	attr_accessor :email, :new_user
  	has_many :enrollments
  	belongs_to :user, :dependent => :destroy
    validate :name_should_be_unique

  	def retrieve_virtual_attributes
      if self.user
  		  self.email = self.user.email
      end
  	end
    def name_should_be_unique
      @students = Student.all
      @students.each do
        |student|
        if student.firstname == firstname && student.lastname == lastname
          errors.add(:base, "Voornaam + Naam moet uniek zijn.")
          return
        end
      end
    end

	def as_json options=nil
      options ||= {}
      options[:methods] = ((options[:methods] || []) + [:email, :new_user])
      super options
    end
end
