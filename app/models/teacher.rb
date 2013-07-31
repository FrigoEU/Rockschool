class Teacher < ActiveRecord::Base
  attr_accessible :firstname, :lastname, :bio, :courses, :start_hours_monday, :start_minutes_monday, :end_hours_monday, :end_minutes_monday, :start_hours_tuesday, :start_minutes_tuesday, :end_hours_tuesday, :end_minutes_tuesday, :start_hours_wednesday, :start_minutes_wednesday, :end_hours_wednesday, :end_minutes_wednesday, :start_hours_thursday, :start_minutes_thursday, :end_hours_thursday, :end_minutes_thursday, :start_hours_friday, :start_minutes_friday, :end_hours_friday, :end_minutes_friday, :start_hours_saturday, :start_minutes_saturday, :end_hours_saturday, :end_minutes_saturday, :start_hours_sunday, :start_minutes_sunday, :end_hours_sunday, :end_minutes_sunday, :user_id, :phone
  has_many :lessons
  has_many :lessongroups, :through => :lessons
  has_many :students, :through => :lessongroups, :uniq => true
  attr_accessor :email, :new_user
  belongs_to :user, :dependent => :destroy
  validate :name_should_be_unique
  validates :firstname, presence: { message:  'De voornaam van de leeraar ontbreekt.'}
  validates :lastname, presence: { message:  'De achternaam van de leeraar ontbreekt.'}
  validates :courses, presence: { message:  'De vakken van de leeraar ontbreken.'}
  validates :start_hours_monday, :end_hours_monday, :start_hours_tuesday, :end_hours_tuesday, :start_hours_wednesday, :end_hours_wednesday, :start_hours_thursday, :end_hours_thursday,  :start_hours_friday, :end_hours_friday , :start_hours_saturday, :end_hours_saturday , :start_hours_sunday, :end_hours_sunday , inclusion: { :in => 0..24 , message:  'De uurgegevens zijn niet correct.'}
  validates :start_minutes_monday, :end_minutes_monday, :start_minutes_tuesday, :end_minutes_tuesday, :start_minutes_wednesday, :end_minutes_wednesday, :start_minutes_thursday, :end_minutes_thursday,  :start_minutes_friday, :end_minutes_friday , :start_minutes_saturday, :end_minutes_saturday , :start_minutes_sunday, :end_minutes_sunday , inclusion: { :in => 0..59 , message: 'De minuutgegevens zijn niet correct.'}

  def name_should_be_unique
  	 @teachers = Teacher.all
      @teachers.each do
        |teacher|
        if teacher.firstname == firstname && teacher.lastname == lastname && teacher.id != id
          errors.add(:base, "Voornaam + Naam moet uniek zijn.")
          return
        end
      end
  end
  def retrieve_virtual_attributes(authorized)
    if authorized
      if self.user
        self.email = self.user.email
      end
    end
  end
  def authorized?(user)
    if user.isAdmin
      true
    elsif user.isTeacher && self.user_id == user.id
      true
    else
      false
    end
  end
  def as_json options=nil
    options ||= {}
    options[:methods] = ((options[:methods] || []) + [:email, :new_user])
    super options
  end

end
