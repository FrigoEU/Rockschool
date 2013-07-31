class User < ActiveRecord::Base
  attr_accessible :email, :password, :password_confirmation, :password_digest, :remember_token, :role
  has_secure_password

  before_save {|user| user.email = email.downcase}
  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
  validates :email, presence: true, 
  					format: { with: VALID_EMAIL_REGEX },
  					uniqueness: { case_sensitive: false }
  validates :password, presence:true, length: {minimum: 6}
  validates :password_confirmation, presence: true
  before_save :create_remember_token

  def getRole
    if not self.role.nil?
      self.role
    end
  end 
  def isAdmin
    self.role == "admin"
  end
  def isTeacher
    self.role == "teacher"
  end
  def isStudent
    self.role == "student"
  end
 def as_json options=nil
    super(:only => [:email, :id])
  end

  private
  	def create_remember_token
      logger.debug("changing remember_token")
	  self.remember_token = SecureRandom.urlsafe_base64
	end
end
