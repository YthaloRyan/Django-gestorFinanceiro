from rest_framework import viewsets
from .models import Transaction, Category
from .serializers import TransactionSerializer, CategorySerializer
from rest_framework.decorators import action
from rest_framework.response import Response

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


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)