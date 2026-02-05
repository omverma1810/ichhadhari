# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vendors', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='goodsreceiptnote',
            name='vehicle_number',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='goodsreceiptnote',
            name='driver_name',
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name='goodsreceiptnote',
            name='driver_phone',
            field=models.CharField(blank=True, max_length=15),
        ),
        migrations.AddField(
            model_name='goodsreceiptnote',
            name='receipt_timestamp',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
