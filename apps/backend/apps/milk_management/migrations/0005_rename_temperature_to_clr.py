"""
Migration to replace temperature field with CLR (Corrected Lactometer Reading).

CLR is the dairy industry standard measurement for milk density verification.
Normal range is 25-32 for good quality milk.
"""

from decimal import Decimal
from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('milk_management', '0004_rename_fields_and_update_rates'),
    ]

    operations = [
        # Step 1: Rename the field
        migrations.RenameField(
            model_name='milkcollection',
            old_name='temperature',
            new_name='clr',
        ),
        # Step 2: Alter to update validators, help_text, and default
        migrations.AlterField(
            model_name='milkcollection',
            name='clr',
            field=models.DecimalField(
                decimal_places=1,
                default=Decimal('0.0'),
                help_text='Corrected Lactometer Reading for milk density (normal range: 25-32)',
                max_digits=4,
                validators=[
                    django.core.validators.MinValueValidator(Decimal('0.0')),
                    django.core.validators.MaxValueValidator(Decimal('50.0')),
                ],
            ),
        ),
    ]
