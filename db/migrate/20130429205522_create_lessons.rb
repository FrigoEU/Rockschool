class CreateLessons < ActiveRecord::Migration
  def change
    create_table :lessons do |t|
      t.datetime :starttime
      t.string :status
      t.integer :duration

      t.timestamps
    end
  end
end
