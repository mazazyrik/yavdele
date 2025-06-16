from django.contrib import admin
from django import forms
from django.utils.html import format_html
from .models import Test


class TestAdminForm(forms.ModelForm):
    answer_1 = forms.CharField(label='1', required=False)
    answer_3 = forms.CharField(label='3', required=False)
    answer_4 = forms.CharField(label='4', required=False)
    answer_5 = forms.CharField(label='5', required=False)
    answer_6 = forms.CharField(label='6', required=False)
    answer_7 = forms.CharField(label='7 (JSON)', required=False)
    answer_8 = forms.CharField(label='8', required=False)
    answer_10 = forms.CharField(label='10', required=False)
    answer_11 = forms.CharField(label='11', required=False)

    class Meta:
        model = Test
        fields = ['points',
                  'answer_1', 'answer_3', 'answer_4',
                  'answer_5', 'answer_6', 'answer_7',
                  'answer_8',  'answer_10', 'answer_11']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        data = self.instance.answers_package or {}

        self.fields['answer_1'].initial = data.get('1', '')
        self.fields['answer_3'].initial = data.get('3', '')
        self.fields['answer_4'].initial = data.get('4', '')
        self.fields['answer_5'].initial = data.get('5', '')
        self.fields['answer_6'].initial = data.get('6', '')
        self.fields['answer_7'].initial = str(data.get('7', ''))
        self.fields['answer_8'].initial = data.get('8', '')
        self.fields['answer_10'].initial = data.get('10', '')
        self.fields['answer_11'].initial = data.get('11', '')

    def clean(self):
        cleaned_data = super().clean()
        self.instance.answers_package = {
            '1': cleaned_data.get('answer_1'),
            '3': cleaned_data.get('answer_3'),
            '4': cleaned_data.get('answer_4'),
            '5': cleaned_data.get('answer_5'),
            '6': cleaned_data.get('answer_6'),
            '7': cleaned_data.get('answer_7'),
            '8': cleaned_data.get('answer_8'),
            '10': cleaned_data.get('answer_10'),
            '11': cleaned_data.get('answer_11'),
        }
        return cleaned_data


@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    form = TestAdminForm
    list_display = ('date_of_test', 'points', 'image_preview', 'audio_player')
    readonly_fields = ['image_preview', 'audio_player']

    def image_preview(self, obj):
        image_data = (obj.answers_package or {}).get('9', '')
        if image_data and image_data.startswith('data:image'):
            return format_html(
                '<img src="{}" style="max-height:200px; max-width: 100%;" />',
                image_data
            )
        return 'Нет изображения'

    image_preview.short_description = 'Изображение из ответа (9)'

    def audio_player(self, obj):
        answer_5 = (obj.answers_package or {}).get('5', {})
        audio_path_5 = ''
        if isinstance(answer_5, dict):
            audio_path_5 = answer_5.get('audio', '')
        answer_6 = (obj.answers_package or {}).get('6', {})
        audio_path_6 = ''
        if isinstance(answer_6, dict):
            audio_path_6 = answer_6.get('audio', '')
        players = []
        print(audio_path_5)
        if audio_path_5:
            players.append(format_html(
                '<audio controls style="width: 300px;">\n  '
                '<source src="{}" type="audio/webm">\n  '
                'Ваш браузер не поддерживает аудио.\n</audio>',
                audio_path_5
            ))
        if audio_path_6:
            players.append(format_html(
                '<audio controls style="width: 300px;">\n  '
                '<source src="{}" type="audio/webm">\n  '
                'Ваш браузер не поддерживает аудио.\n</audio>',
                audio_path_6
            ))
        if players:
            return format_html(''.join(str(p) for p in players))
        return 'Нет аудиозаписи'

    audio_player.short_description = 'Аудио (5, 6)'
