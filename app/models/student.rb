class Student < ActiveRecord::Base
  	attr_accessible :firstname, :lastname, :phone, :address1, :address2, :user_id
  	attr_accessor :email
  	has_many :enrollments
  	belongs_to :user
    validate :name_should_be_unique
    validates :firstname, :presence => { :message => "Voornaam is verplicht." }
    validates :lastname, :presence => { :message => "Achternaam is verplicht." }
    validates :phone, :presence => { :message => "Telefoonnummer is verplicht." }
    validates :address1, :presence => { :message => "Adreslijn 1 is verplicht." }
    validates :address2, :presence => { :message => "Adreslijn 2 is verplicht." }

  	
    def name_should_be_unique
      @students = Student.all
      @students.each do
        |student|
        if student.firstname == firstname && student.lastname == lastname && student.id != id
          errors.add(:base, "Voornaam + Naam moet uniek zijn.")
          return
        end
      end
    end
    def retrieve_virtual_attributes
      if self.user
        self.email = self.user.email
      end
    end
	  def as_json options=nil
      options ||= {}
      options[:methods] = ((options[:methods] || []) + [:email])
      super options
    end
end
