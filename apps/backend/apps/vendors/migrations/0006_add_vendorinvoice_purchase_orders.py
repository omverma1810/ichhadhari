from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("vendors", "0005_merge_20260205_2321"),
    ]

    operations = [
        migrations.AddField(
            model_name="vendorinvoice",
            name="purchase_orders",
            field=models.ManyToManyField(
                blank=True,
                related_name="invoices",
                to="vendors.purchaseorder",
            ),
        ),
    ]
