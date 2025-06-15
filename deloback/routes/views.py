from rest_framework import viewsets
from .serializers import TestSerializer
from .models import Test
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.core.files.storage import default_storage
import os


class TestViewSet(viewsets.ModelViewSet):
    serializer_class = TestSerializer
    queryset = Test.objects.all()


class AudioUploadView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, format=None):
        audio_file = request.FILES['audio']
        filename = default_storage.save(f'audio/{audio_file.name}', audio_file)
        file_url = os.path.join('/media/', filename)
        return Response({'audio_path': file_url})
