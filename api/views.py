from rest_framework import viewsets
from .models import Transaction, Category
from .serializers import TransactionSerializer, CategorySerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Case, When, F, DecimalField
from rest_framework import status

from datetime import date
from calendar import monthrange

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer

    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user).order_by('-date')

        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')

        if month:
            queryset = queryset.filter(date__month=month)
        if year:
            queryset = queryset.filter(date__year=year)

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    @action(detail=False, methods=['get'])
    def available_years(self, request):
        years = (
            Transaction.objects.filter(user=request.user)
            .dates('date', 'year')
        )
        year_list = sorted({d.year for d in years}, reverse=True)
        return Response(year_list)
    
    
    @action(detail=False, methods=['get'])
    def accumulated_balance(self, request):
        today = date.today()
        
        year_param = request.query_params.get('year')
        month_param = request.query_params.get('month')
        
        print(f"Received parameters - Year: {year_param}, Month: {month_param}")  # Log for debugging
        
        try:
            year = int(year_param) if year_param else today.year
            month = int(month_param) if month_param else today.month
        except ValueError:
            return Response(
                {'error': 'year and month must be valid integers'},
                status=status.HTTP_400_BAD_REQUEST
            )

        
        if month < 1 or month > 12:
            return Response(
                {'error': 'month must be between 1 and 12'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        

        last_day = monthrange(year, month)[1]
        end_date = date(year, month, last_day)

        result = Transaction.objects.filter(
            user=request.user,
            date__lte=end_date
        ).aggregate(
            balance=Sum(
                Case(
                    When(type='IN', then=F('amount')),
                    When(type='OUT', then=-F('amount')),
                    output_field=DecimalField()
                )
            )
        )

        
        balance = result['balance'] or 0
        

        return Response(balance)


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)