
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet

# A DefaultRouter automatically creates the /api/tickets/ and /api/tickets/<id>/ routes
router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')

urlpatterns = [
    path('', include(router.urls)),
]