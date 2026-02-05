# Generated migration for milk pricing model changes

from django.db import migrations, models
from decimal import Decimal
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('milk_management', '0003_fix_quality_score_max_digits'),
    ]

    operations = [
        # Step 1: Rename fat_percentage to fat and snf_percentage to snf
        migrations.RenameField(
            model_name='milkcollection',
            old_name='fat_percentage',
            new_name='fat',
        ),
        migrations.RenameField(
            model_name='milkcollection',
            old_name='snf_percentage',
            new_name='snf',
        ),
        
        # Step 2: Update field validators for fat and snf (now measured in kg/L, not percentage)
        migrations.AlterField(
            model_name='milkcollection',
            name='fat',
            field=models.DecimalField(
                decimal_places=2,
                help_text='Fat content (kg per liter)',
                max_digits=4,
                validators=[
                    django.core.validators.MinValueValidator(Decimal('0.00')),
                    django.core.validators.MaxValueValidator(Decimal('15.00'))
                ]
            ),
        ),
        migrations.AlterField(
            model_name='milkcollection',
            name='snf',
            field=models.DecimalField(
                decimal_places=2,
                help_text='SNF - Solids Not Fat (kg per liter)',
                max_digits=4,
                validators=[
                    django.core.validators.MinValueValidator(Decimal('0.00')),
                    django.core.validators.MaxValueValidator(Decimal('15.00'))
                ]
            ),
        ),
        
        # Step 3: Rename rate_per_liter to rate_per_fat
        migrations.RenameField(
            model_name='milkcollection',
            old_name='rate_per_liter',
            new_name='rate_per_fat',
        ),
        
        # Step 4: Update rate_per_fat help text
        migrations.AlterField(
            model_name='milkcollection',
            name='rate_per_fat',
            field=models.DecimalField(
                decimal_places=2,
                help_text='Rate per kg of fat',
                max_digits=8
            ),
        ),
        
        # Step 5: Add new rate_per_snf field with default value
        migrations.AddField(
            model_name='milkcollection',
            name='rate_per_snf',
            field=models.DecimalField(
                decimal_places=2,
                default=Decimal('10.00'),
                help_text='Rate per kg of SNF',
                max_digits=8
            ),
        ),
        
        # Step 6: Add new price_per_liter field (computed field)
        migrations.AddField(
            model_name='milkcollection',
            name='price_per_liter',
            field=models.DecimalField(
                decimal_places=2,
                default=Decimal('0.00'),
                help_text='Calculated price per liter',
                max_digits=10
            ),
        ),
        
        # Step 7: Update total_amount help text to reflect new calculation
        migrations.AlterField(
            model_name='milkcollection',
            name='total_amount',
            field=models.DecimalField(
                decimal_places=2,
                default=Decimal('0.00'),
                help_text='Total amount for this collection (quantity × price_per_liter)',
                max_digits=10
            ),
        ),
    ]
