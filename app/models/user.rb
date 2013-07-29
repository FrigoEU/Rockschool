class User < ActiveRecord::Base
  attr_accessible :email, :password, :password_confirmation, :password_digest, :remember_token, :role, :role_id
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
  def getRoleID
    if not self.role_id.nil?
      self.role_id
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

  private
  	def create_remember_token
	  self.remember_token = SecureRandom.urlsafe_base64
	end
end
