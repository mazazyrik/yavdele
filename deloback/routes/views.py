import os
from rest_framework import viewsets
from .serializers import TestSerializer
from .models import Test
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.core.files.storage import default_storage
from rest_framework.authentication import SessionAuthentication
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return


class TestViewSet(viewsets.ModelViewSet):
    serializer_class = TestSerializer
    queryset = Test.objects.all()
    authentication_classes = [CsrfExemptSessionAuthentication]


@method_decorator(csrf_exempt, name='dispatch')
class AudioUploadView(APIView):
    parser_classes = [MultiPartParser]
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request, format=None):
        audio_file = request.FILES['audio']
        filename = default_storage.save(f'audio/{audio_file.name}', audio_file)
        file_url = os.path.join('/media/', filename)
        return Response({'audio_path': file_url})
