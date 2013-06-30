class AddEndtimeToLessons < ActiveRecord::Migration
  def change
    add_column :lessons, :endtime, :datetime
  end
end
