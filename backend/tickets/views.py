from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q, Min
from django.utils import timezone
from .models import Ticket
from .serializers import TicketSerializer

class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    http_method_names = ['get', 'post', 'patch']
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description'] 

    def get_queryset(self):
        queryset = Ticket.objects.all().order_by('-created_at')
        
        category = self.request.query_params.get('category')
        priority = self.request.query_params.get('priority')
        status = self.request.query_params.get('status')

        if category:
            queryset = queryset.filter(category=category)
        if priority:
            queryset = queryset.filter(priority=priority)
        if status:
            queryset = queryset.filter(status=status)
            
        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        aggregates = Ticket.objects.aggregate(
            total=Count('id'),
            open=Count('id', filter=Q(status='open')),
            first_date=Min('created_at')
        )
        
        total_tickets = aggregates['total'] or 0
        open_tickets = aggregates['open'] or 0
        first_date = aggregates['first_date']
        
        avg_tickets_per_day = 0
        if total_tickets > 0 and first_date:
            days_active = (timezone.now() - first_date).days
            days_active = max(1, days_active) # Prevent division by zero if created today
            avg_tickets_per_day = round(total_tickets / days_active, 1)

        priority_qs = Ticket.objects.values('priority').annotate(count=Count('id'))
        category_qs = Ticket.objects.values('category').annotate(count=Count('id'))

        priority_breakdown = {item['priority']: item['count'] for item in priority_qs}
        category_breakdown = {item['category']: item['count'] for item in category_qs}

        for choice, _ in Ticket.PRIORITY_CHOICES:
            priority_breakdown.setdefault(choice, 0)
        for choice, _ in Ticket.CATEGORY_CHOICES:
            category_breakdown.setdefault(choice, 0)

        return Response({
            "total_tickets": total_tickets,
            "open_tickets": open_tickets,
            "avg_tickets_per_day": avg_tickets_per_day,
            "priority_breakdown": priority_breakdown,
            "category_breakdown": category_breakdown
        })