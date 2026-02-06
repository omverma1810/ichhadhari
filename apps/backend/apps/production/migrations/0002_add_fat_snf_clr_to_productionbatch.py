"""
Add fat, snf, clr fields to ProductionBatch for milk quality tracking.
"""

from decimal import Decimal
from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('production', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='productionbatch',
            name='fat',
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                help_text='Fat content (kg per liter)',
                max_digits=4,
                null=True,
                validators=[
                    django.core.validators.MinValueValidator(Decimal('0.00')),
                    django.core.validators.MaxValueValidator(Decimal('15.00')),
                ],
            ),
        ),
        migrations.AddField(
            model_name='productionbatch',
            name='snf',
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                help_text='SNF - Solids Not Fat (kg per liter)',
                max_digits=4,
                null=True,
                validators=[
                    django.core.validators.MinValueValidator(Decimal('0.00')),
                    django.core.validators.MaxValueValidator(Decimal('15.00')),
                ],
            ),
        ),
        migrations.AddField(
            model_name='productionbatch',
            name='clr',
            field=models.DecimalField(
                blank=True,
                decimal_places=1,
                help_text='Corrected Lactometer Reading for milk density (normal range: 25-32)',
                max_digits=4,
                null=True,
                validators=[
                    django.core.validators.MinValueValidator(Decimal('0.0')),
                    django.core.validators.MaxValueValidator(Decimal('50.0')),
                ],
            ),
        ),
    ]
