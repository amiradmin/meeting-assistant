# load_fixtures.py
import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project.settings')  # Replace with your project name
django.setup()

from django.core.management import call_command


def load_sample_data():
    """Load sample data for production orders"""
    print("Loading sample data...")

    try:
        # Load steel grades first (if not already loaded)
        print("Loading steel grades...")
        call_command('loaddata', 'lf/fixtures/steel_grades.json', verbosity=1)
    except Exception as e:
        print(f"Steel grades may already exist: {e}")

    try:
        # Load sample heat data
        print("Loading heat data...")
        call_command('loaddata', 'lf/fixtures/sample_heat_data.json', verbosity=1)
    except Exception as e:
        print(f"Error loading heat data: {e}")

    try:
        # Load production order data
        print("Loading production order data...")
        call_command('loaddata', 'production/fixtures/sample_production_data.json', verbosity=1)
    except Exception as e:
        print(f"Error loading production orders: {e}")

    print("Sample data loaded successfully!")


if __name__ == "__main__":
    load_sample_data()