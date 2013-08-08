class CreateInvoices < ActiveRecord::Migration
  def change
    create_table :invoices do |t|
      t.integer :enrollment_id
      t.decimal :amount, :precision => 6, :scale => 2
      t.boolean :paid
      t.datetime :due_date
      t.timestamps
    end
  end
end
