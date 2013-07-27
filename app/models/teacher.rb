class Teacher < ActiveRecord::Base
  attr_accessible :firstname, :lastname, :bio, :courses, :start_hours_monday, :start_minutes_monday, :end_hours_monday, :end_minutes_monday, :start_hours_tuesday, :start_minutes_tuesday, :end_hours_tuesday, :end_minutes_tuesday, :start_hours_wednesday, :start_minutes_wednesday, :end_hours_wednesday, :end_minutes_wednesday, :start_hours_thursday, :start_minutes_thursday, :end_hours_thursday, :end_minutes_thursday, :start_hours_friday, :start_minutes_friday, :end_hours_friday, :end_minutes_friday, :start_hours_saturday, :start_minutes_saturday, :end_hours_saturday, :end_minutes_saturday, :start_hours_sunday, :start_minutes_sunday, :end_hours_sunday, :end_minutes_sunday
  has_many :lessons
  has_many :lessongroups, :through => :lessons
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

end
