"""
Add product quality parameters to ProductionBatch.
"""

from decimal import Decimal
from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ("production", "0002_add_fat_snf_clr_to_productionbatch"),
    ]

    operations = [
        migrations.AddField(
            model_name="productionbatch",
            name="product_fat",
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                help_text="Product fat content (kg per liter)",
                max_digits=4,
                null=True,
                validators=[
                    django.core.validators.MinValueValidator(Decimal("0.00")),
                    django.core.validators.MaxValueValidator(Decimal("15.00")),
                ],
            ),
        ),
        migrations.AddField(
            model_name="productionbatch",
            name="product_snf",
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                help_text="Product SNF - Solids Not Fat (kg per liter)",
                max_digits=4,
                null=True,
                validators=[
                    django.core.validators.MinValueValidator(Decimal("0.00")),
                    django.core.validators.MaxValueValidator(Decimal("15.00")),
                ],
            ),
        ),
        migrations.AddField(
            model_name="productionbatch",
            name="product_clr",
            field=models.DecimalField(
                blank=True,
                decimal_places=1,
                help_text="Product Corrected Lactometer Reading for density (normal range: 25-32)",
                max_digits=4,
                null=True,
                validators=[
                    django.core.validators.MinValueValidator(Decimal("0.0")),
                    django.core.validators.MaxValueValidator(Decimal("50.0")),
                ],
            ),
        ),
    ]
