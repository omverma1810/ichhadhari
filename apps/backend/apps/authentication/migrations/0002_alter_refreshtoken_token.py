# Generated migration for changing RefreshToken.token from CharField to TextField

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='refreshtoken',
            name='token',
            field=models.TextField(help_text='The refresh token string', unique=True),
        ),
    ]
