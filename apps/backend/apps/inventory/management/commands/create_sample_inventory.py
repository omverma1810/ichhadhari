from django.core.management.base import BaseCommand
from apps.inventory.models import InventoryItem
from decimal import Decimal


class Command(BaseCommand):
    help = 'Create sample inventory items for testing and demonstration'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Creating sample inventory items...'))

        items = [
            # Raw Materials
            {
                'item_id': 'RM-001',
                'name': 'Whole Milk Powder',
                'item_type': 'raw_material',
                'description': 'High-quality whole milk powder for production',
                'unit': 'kg',
                'cost_per_unit': Decimal('450.00'),
                'current_stock': Decimal('500.00'),
                'min_stock_level': Decimal('100.00'),
                'max_stock_level': Decimal('1000.00'),
                'reorder_point': Decimal('150.00'),
                'storage_location': 'Cold Storage A',
                'storage_temperature': '4°C',
            },
            {
                'item_id': 'RM-002',
                'name': 'Sugar',
                'item_type': 'raw_material',
                'description': 'Refined white sugar for dairy products',
                'unit': 'kg',
                'cost_per_unit': Decimal('40.00'),
                'current_stock': Decimal('200.00'),
                'min_stock_level': Decimal('50.00'),
                'max_stock_level': Decimal('500.00'),
                'reorder_point': Decimal('75.00'),
                'storage_location': 'Dry Storage B',
                'storage_temperature': 'Room Temperature',
            },
            {
                'item_id': 'RM-003',
                'name': 'Cultures & Enzymes',
                'item_type': 'raw_material',
                'description': 'Bacterial cultures for yogurt and cheese production',
                'unit': 'kg',
                'cost_per_unit': Decimal('2500.00'),
                'current_stock': Decimal('10.00'),
                'min_stock_level': Decimal('2.00'),
                'max_stock_level': Decimal('20.00'),
                'reorder_point': Decimal('5.00'),
                'storage_location': 'Freezer A',
                'storage_temperature': '-18°C',
            },
            {
                'item_id': 'RM-004',
                'name': 'Vanilla Extract',
                'item_type': 'raw_material',
                'description': 'Natural vanilla extract for flavored products',
                'unit': 'liter',
                'cost_per_unit': Decimal('800.00'),
                'current_stock': Decimal('15.00'),
                'min_stock_level': Decimal('5.00'),
                'max_stock_level': Decimal('30.00'),
                'reorder_point': Decimal('8.00'),
                'storage_location': 'Dry Storage A',
                'storage_temperature': 'Room Temperature',
            },
            
            # Packaging Materials
            {
                'item_id': 'PKG-001',
                'name': 'Milk Bottles (500ml)',
                'item_type': 'packaging',
                'description': 'HDPE bottles for fresh milk',
                'unit': 'piece',
                'cost_per_unit': Decimal('5.00'),
                'current_stock': Decimal('2000.00'),
                'min_stock_level': Decimal('500.00'),
                'max_stock_level': Decimal('5000.00'),
                'reorder_point': Decimal('1000.00'),
                'storage_location': 'Packaging Store A',
                'storage_temperature': 'Room Temperature',
            },
            {
                'item_id': 'PKG-002',
                'name': 'Yogurt Cups (200ml)',
                'item_type': 'packaging',
                'description': 'Plastic cups with lids for yogurt',
                'unit': 'piece',
                'cost_per_unit': Decimal('3.00'),
                'current_stock': Decimal('5000.00'),
                'min_stock_level': Decimal('1000.00'),
                'max_stock_level': Decimal('10000.00'),
                'reorder_point': Decimal('2000.00'),
                'storage_location': 'Packaging Store A',
                'storage_temperature': 'Room Temperature',
            },
            {
                'item_id': 'PKG-003',
                'name': 'Cheese Packaging Paper',
                'item_type': 'packaging',
                'description': 'Food-grade wrapping paper for cheese',
                'unit': 'pack',
                'cost_per_unit': Decimal('150.00'),
                'current_stock': Decimal('50.00'),
                'min_stock_level': Decimal('10.00'),
                'max_stock_level': Decimal('100.00'),
                'reorder_point': Decimal('20.00'),
                'storage_location': 'Packaging Store B',
                'storage_temperature': 'Room Temperature',
            },
            {
                'item_id': 'PKG-004',
                'name': 'Cardboard Boxes (Large)',
                'item_type': 'packaging',
                'description': 'Large cardboard boxes for shipping',
                'unit': 'piece',
                'cost_per_unit': Decimal('25.00'),
                'current_stock': Decimal('200.00'),
                'min_stock_level': Decimal('50.00'),
                'max_stock_level': Decimal('500.00'),
                'reorder_point': Decimal('100.00'),
                'storage_location': 'Packaging Store C',
                'storage_temperature': 'Room Temperature',
            },
            
            # Raw Milk Inventory
            {
                'item_id': 'MILK-001',
                'name': 'Raw Cow Milk',
                'item_type': 'raw_milk',
                'description': 'Fresh cow milk collected from farms',
                'unit': 'liter',
                'cost_per_unit': Decimal('35.00'),
                'current_stock': Decimal('1000.00'),
                'min_stock_level': Decimal('200.00'),
                'max_stock_level': Decimal('5000.00'),
                'reorder_point': Decimal('500.00'),
                'storage_location': 'Milk Storage Tank 1',
                'storage_temperature': '4°C',
            },
            {
                'item_id': 'MILK-002',
                'name': 'Raw Buffalo Milk',
                'item_type': 'raw_milk',
                'description': 'Fresh buffalo milk collected from farms',
                'unit': 'liter',
                'cost_per_unit': Decimal('45.00'),
                'current_stock': Decimal('500.00'),
                'min_stock_level': Decimal('100.00'),
                'max_stock_level': Decimal('2000.00'),
                'reorder_point': Decimal('250.00'),
                'storage_location': 'Milk Storage Tank 2',
                'storage_temperature': '4°C',
            },
        ]

        created_count = 0
        existing_count = 0

        for item_data in items:
            item, created = InventoryItem.objects.get_or_create(
                item_id=item_data['item_id'],
                defaults=item_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created: {item.item_id} - {item.name}')
                )
            else:
                existing_count += 1
                self.stdout.write(
                    self.style.WARNING(f'○ Already exists: {item.item_id} - {item.name}')
                )

        self.stdout.write(self.style.SUCCESS(f'\n{"-" * 50}'))
        self.stdout.write(self.style.SUCCESS(f'Summary:'))
        self.stdout.write(self.style.SUCCESS(f'  Created: {created_count}'))
        self.stdout.write(self.style.WARNING(f'  Existing: {existing_count}'))
        self.stdout.write(self.style.SUCCESS(f'  Total: {created_count + existing_count}'))
        self.stdout.write(self.style.SUCCESS(f'{"-" * 50}\n'))
        
        self.stdout.write(self.style.SUCCESS('Sample inventory items created successfully!'))
