# Generated migration file for inventory app

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.core.validators
from decimal import Decimal


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('production', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='InventoryItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('item_id', models.CharField(db_index=True, max_length=30, unique=True)),
                ('name', models.CharField(max_length=200)),
                ('item_type', models.CharField(choices=[('raw_milk', 'Raw Milk'), ('raw_material', 'Raw Material'), ('finished_good', 'Finished Good'), ('packaging', 'Packaging Material')], max_length=20)),
                ('description', models.TextField(blank=True)),
                ('unit', models.CharField(choices=[('kg', 'Kilogram'), ('liter', 'Liter'), ('piece', 'Piece'), ('pack', 'Pack'), ('bag', 'Bag'), ('box', 'Box')], max_length=10)),
                ('cost_per_unit', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('current_stock', models.DecimalField(decimal_places=2, default=0, max_digits=12, validators=[django.core.validators.MinValueValidator(Decimal('0.00'))])),
                ('min_stock_level', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('max_stock_level', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('reorder_point', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('storage_location', models.CharField(blank=True, max_length=100)),
                ('storage_temperature', models.CharField(blank=True, max_length=50)),
                ('is_active', models.BooleanField(default=True)),
                ('product', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='inventory', to='production.product')),
            ],
            options={
                'db_table': 'inventory_items',
                'ordering': ['item_id'],
            },
        ),
        migrations.CreateModel(
            name='StockTransaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('transaction_id', models.CharField(db_index=True, max_length=30, unique=True)),
                ('transaction_type', models.CharField(choices=[('purchase', 'Purchase'), ('production', 'Production'), ('sale', 'Sale'), ('wastage', 'Wastage'), ('adjustment', 'Adjustment'), ('return', 'Return'), ('transfer', 'Transfer')], max_length=20)),
                ('transaction_date', models.DateTimeField()),
                ('quantity', models.DecimalField(decimal_places=2, max_digits=12)),
                ('is_addition', models.BooleanField(help_text='True for IN, False for OUT')),
                ('stock_before', models.DecimalField(decimal_places=2, max_digits=12)),
                ('stock_after', models.DecimalField(decimal_places=2, max_digits=12)),
                ('unit_cost', models.DecimalField(decimal_places=2, max_digits=10)),
                ('total_cost', models.DecimalField(decimal_places=2, max_digits=12)),
                ('reference_type', models.CharField(blank=True, max_length=50)),
                ('reference_id', models.CharField(blank=True, max_length=50)),
                ('batch_number', models.CharField(blank=True, max_length=50)),
                ('expiry_date', models.DateField(blank=True, null=True)),
                ('notes', models.TextField(blank=True)),
                ('item', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='transactions', to='inventory.inventoryitem')),
                ('performed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'stock_transactions',
                'ordering': ['-transaction_date'],
            },
        ),
        migrations.CreateModel(
            name='RawMaterialStock',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('supplier_name', models.CharField(max_length=200)),
                ('batch_number', models.CharField(max_length=50)),
                ('purchase_date', models.DateField()),
                ('expiry_date', models.DateField(blank=True, null=True)),
                ('quantity', models.DecimalField(decimal_places=2, max_digits=10)),
                ('cost_per_unit', models.DecimalField(decimal_places=2, max_digits=10)),
                ('total_cost', models.DecimalField(decimal_places=2, max_digits=12)),
                ('is_active', models.BooleanField(default=True)),
                ('item', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='raw_material_batches', to='inventory.inventoryitem')),
            ],
            options={
                'db_table': 'raw_material_stocks',
                'ordering': ['-purchase_date'],
            },
        ),
        migrations.CreateModel(
            name='FinishedGoodsStock',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('quantity', models.DecimalField(decimal_places=2, max_digits=10)),
                ('production_date', models.DateField()),
                ('expiry_date', models.DateField()),
                ('quality_check_passed', models.BooleanField(default=True)),
                ('shop_location', models.CharField(blank=True, max_length=100)),
                ('is_sold', models.BooleanField(default=False)),
                ('batch', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='finished_stock', to='production.productionbatch')),
                ('item', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='finished_goods_batches', to='inventory.inventoryitem')),
            ],
            options={
                'db_table': 'finished_goods_stocks',
                'ordering': ['-production_date'],
            },
        ),
        migrations.CreateModel(
            name='StockAlert',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('alert_type', models.CharField(choices=[('low_stock', 'Low Stock'), ('reorder_point', 'Reorder Point Reached'), ('expiring_soon', 'Expiring Soon'), ('expired', 'Expired')], max_length=20)),
                ('status', models.CharField(choices=[('active', 'Active'), ('acknowledged', 'Acknowledged'), ('resolved', 'Resolved')], default='active', max_length=20)),
                ('message', models.TextField()),
                ('acknowledged_at', models.DateTimeField(blank=True, null=True)),
                ('resolved_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('acknowledged_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='acknowledged_alerts', to=settings.AUTH_USER_MODEL)),
                ('item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='alerts', to='inventory.inventoryitem')),
                ('resolved_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='resolved_alerts', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'stock_alerts',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='inventoryitem',
            index=models.Index(fields=['item_id'], name='inventory_i_item_id_b8e9e7_idx'),
        ),
        migrations.AddIndex(
            model_name='inventoryitem',
            index=models.Index(fields=['item_type'], name='inventory_i_item_ty_8f3c9a_idx'),
        ),
        migrations.AddIndex(
            model_name='stocktransaction',
            index=models.Index(fields=['transaction_id'], name='stock_trans_transac_f8a9c1_idx'),
        ),
        migrations.AddIndex(
            model_name='stocktransaction',
            index=models.Index(fields=['item', 'transaction_date'], name='stock_trans_item_id_4e7f2b_idx'),
        ),
        migrations.AddIndex(
            model_name='stocktransaction',
            index=models.Index(fields=['transaction_type'], name='stock_trans_transac_9d2e5c_idx'),
        ),
    ]
