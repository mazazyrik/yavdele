from django.db import models


class Test(models.Model):
    date_of_test = models.DateField(auto_now_add=True)
    answers_package = models.JSONField(null=True)
    points = models.IntegerField(null=True)

    class Meta:
        db_table = 'test'

    def __str__(self):
        return str(self.id)
