from rest_framework import serializers
from .models import Transaction, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'type', 'amount', 'category', 'description', 'date', 'created_at']
        read_only_fields = ['id', 'created_at']
        
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("O valor precisa ser maior que zero.")
        return value