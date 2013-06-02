class CreatePeriods < ActiveRecord::Migration
  def change
    create_table :periods do |t|
      t.date :startdate
      t.boolean :open_on_monday
      t.boolean :open_on_tuesday
      t.boolean :open_on_wednesday
      t.boolean :open_on_thursday
      t.boolean :open_on_friday
      t.boolean :open_on_saturday
      t.boolean :open_on_sunday
      t.integer :openinghours
      t.integer :openingminutes
      t.integer :closinghours
      t.integer :closingminutes
      t.date :enddate
      t.boolean :open_for_registration

      t.timestamps
    end
  end
end
