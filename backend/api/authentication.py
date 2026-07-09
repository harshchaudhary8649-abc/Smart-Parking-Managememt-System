import jwt
from django.conf import settings
from rest_framework import authentication, exceptions
from .models import CustomUser

class CustomJWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header[7:]
        try:
            secret = getattr(settings, 'JWT_SECRET', 'smart_parking_local_secret')
            payload = jwt.decode(token, secret, algorithms=['HS256'])
            user_id = payload.get('id')
            user = CustomUser.objects.filter(id=user_id).first()
            if not user:
                raise exceptions.AuthenticationFailed('User no longer exists')
            return (user, token)
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Invalid token')
