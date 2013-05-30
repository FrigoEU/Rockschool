class CreateLessons < ActiveRecord::Migration
  def change
    create_table :lessons do |t|
      t.datetime :startTime
      t.string :status
      t.integer :duration

      t.timestamps
    end
  end
end
