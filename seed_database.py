import os
from dotenv import load_dotenv
from google.cloud import firestore
from datetime import datetime, timedelta, timezone

# --- Initialization ---
print("🌱 Starting database seeding script...")

# Load environment variables from .env file
load_dotenv()

# Explicitly get the path from the loaded environment variables
credentials_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")

if not credentials_path:
    print("❌ GOOGLE_APPLICATION_CREDENTIALS not found in .env file or environment.")
    print("🛑 Seeding script cannot continue without a database connection.")
    exit()

if not os.path.exists(credentials_path):
    print(f"❌ Credentials file not found at path: {credentials_path}")
    print("🛑 Please ensure the path in your .env file is correct.")
    exit()

try:
    # Initialize client using the specific service account file
    db = firestore.Client.from_service_account_json(credentials_path)
    print("✅ Firestore client initialized successfully using service account file.")
except Exception as e:
    print(f"❌ Error initializing Firestore client: {e}")
    print("🛑 Seeding script cannot continue without a database connection.")
    exit()


def seed_collection(collection_name, data, id_field=None):
    """
    Seeds a Firestore collection with provided data.
    Checks if the collection is empty before seeding.
    """
    collection_ref = db.collection(collection_name)
    
    # Check if collection already has documents
    if next(collection_ref.stream(), None):
        print(f"🔵 Collection '{collection_name}' already contains data. Skipping seeding.")
        return

    print(f"🚀 Seeding collection: '{collection_name}'...")
    for item in data:
        if id_field and id_field in item:
            doc_id = item[id_field]
            doc_ref = collection_ref.document(doc_id)
            doc_ref.set(item)
        else:
            collection_ref.add(item)
    print(f"✅ Finished seeding '{collection_name}'.")


def main():
    """
    Main function to define data and run the seeding process for all collections.
    """
    print("\n--- Preparing Data ---")

    # --- Users Data ---
    users_data = [
        {'name': 'Priya Sharma', 'role': 'admin', 'password': 'admin123', 'permissions': ['all']},
        {'name': 'Rajesh Kumar', 'role': 'zookeeper', 'password': 'zoo123', 'permissions': ['view_animals', 'update_logs']},
        {'name': 'Dr. Anjali Verma', 'role': 'vet', 'password': 'vet123', 'permissions': ['view_health', 'prescribe']},
        {'name': 'Vikram Singh', 'role': 'officer', 'password': 'officer123', 'permissions': ['view_food', 'view_costs']},
        {'name': 'Sunita Devi', 'role': 'zookeeper', 'password': 'zoo123', 'permissions': ['view_animals', 'update_logs']},
    ]

    # --- Animals Data ---
    animals_data = [
        { 'id': 'A001', 'number': '001', 'name': 'Simba', 'species': 'Lion', 'age': '5 years', 'enclosure': 'A-12', 'image': 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400', 'health': 'excellent', 'assignedTo': 'Rajesh Kumar' },
        { 'id': 'A002', 'number': '002', 'name': 'Raja', 'species': 'Bengal Tiger', 'age': '8 years', 'enclosure': 'B-3', 'image': 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=400', 'health': 'good', 'assignedTo': 'Sunita Devi' },
        { 'id': 'A003', 'number': '003', 'name': 'Moti', 'species': 'Elephant', 'age': '15 years', 'enclosure': 'C-1', 'image': 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400', 'health': 'fair', 'assignedTo': 'Rajesh Kumar' },
        { 'id': 'A004', 'number': '004', 'name': 'Zara', 'species': 'Giraffe', 'age': '7 years', 'enclosure': 'D-5', 'image': 'https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=400', 'health': 'excellent', 'assignedTo': 'Sunita Devi' },
    ]

    # --- Observations Data ---
    # Note: Firestore Timestamps are timezone-aware (UTC)
    observations_data = [
        {
            'animalId': 'A001',
            'submittedBy': 'Rajesh Kumar',
            'createdAt': datetime.now(timezone.utc) - timedelta(days=1),
            'healthStatus': 'excellent',
            'moodPercentage': 85,
            'appetitePercentage': 90,
            'movementPercentage': 80,
            'injuriesText': 'None observed.',
            'generalObservationText': 'Simba was very playful today, especially with the new enrichment toy. Responded well to calls.',
            'sharedWith': [],
            'aiSummary': {
                'date_or_day': (datetime.now(timezone.utc) - timedelta(days=1)).strftime('%Y-%m-%d'),
                'daily_animal_health_monitoring': 'Animal was active and healthy, with good appetite.',
                'normal_behaviour_status': True,
            }
        }
    ]

    # --- Alerts Data ---
    alerts_data = [
        {
            'type': 'sos',
            'animalName': 'Simba',
            'message': 'Emergency alert - Lion showing distress',
            'location': 'Enclosure A-12',
            'status': 'active',
            'createdAt': (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat(),
            'createdBy': 'Rajesh Kumar'
        },
        {
            'type': 'health',
            'animalName': 'Raja',
            'message': 'Health check due - Urgent attention needed',
            'location': 'Enclosure B-3',
            'status': 'active',
            'createdAt': (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat(),
            'createdBy': 'System'
        }
    ]

    # --- Feeding Records Data ---
    feeding_records_data = [
        {
            'animalId': 'A001',
            'feedType': 'Meat',
            'amount': '15 kg',
            'cost': 450,
            'status': 'completed',
            'recordedAt': (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat(),
            'recordedBy': 'Vikram Singh'
        },
        {
            'animalId': 'A002',
            'feedType': 'Meat',
            'amount': '12 kg',
            'cost': 400,
            'status': 'completed',
            'recordedAt': (datetime.now(timezone.utc) - timedelta(hours=4)).isoformat(),
            'recordedBy': 'Vikram Singh'
        },
        {
            'animalId': 'A003',
            'feedType': 'Vegetables',
            'amount': '120 kg',
            'cost': 2400,
            'status': 'pending',
            'recordedAt': (datetime.now(timezone.utc) - timedelta(hours=6)).isoformat(),
            'recordedBy': 'System'
        }
    ]

    # --- Inventory Data ---
    inventory_data = [
        {'name': 'Raw Meat', 'category': 'food', 'quantity': 150, 'unit': 'kg', 'minThreshold': 50, 'cost': 450, 'lastRestocked': '2 days ago', 'supplier': 'Fresh Farms'},
        {'name': 'Vegetables Mix', 'category': 'food', 'quantity': 200, 'unit': 'kg', 'minThreshold': 75, 'cost': 120, 'lastRestocked': '1 day ago', 'supplier': 'Green Harvest'},
        {'name': 'Antibiotics (Amoxicillin)', 'category': 'medicine', 'quantity': 25, 'unit': 'bottles', 'minThreshold': 10, 'cost': 1200, 'lastRestocked': '1 week ago', 'expiryDate': '2026-12-31', 'supplier': 'MediVet Supplies'},
        {'name': 'Pain Relief (Ibuprofen)', 'category': 'medicine', 'quantity': 8, 'unit': 'boxes', 'minThreshold': 15, 'cost': 800, 'lastRestocked': '3 weeks ago', 'expiryDate': '2026-06-30', 'supplier': 'MediVet Supplies'},
    ]

    # --- Medications Data ---
    medications_data = [
        {
            'animalId': 'A003',
            'medicationName': 'Pain Relief - Ibuprofen',
            'dosage': '200mg',
            'frequency': 'As needed for limp',
            'startDate': (datetime.now(timezone.utc) - timedelta(days=1)).strftime('%Y-%m-%d'),
            'endDate': (datetime.now(timezone.utc) + timedelta(days=6)).strftime('%Y-%m-%d'),
            'prescribedBy': 'Dr. Anjali Verma',
            'purpose': 'Joint pain management for observed limp.',
            'status': 'active',
            'administrationLog': [],
            'notes': 'Administer after meals. Monitor for improvement.',
        }
    ]

    print("--- Starting Seeding Process ---")
    # Seed all collections
    seed_collection('users', users_data)
    seed_collection('animals', animals_data, id_field='id')
    seed_collection('observations', observations_data)
    seed_collection('alerts', alerts_data)
    seed_collection('feeding_records', feeding_records_data)
    seed_collection('inventory', inventory_data)
    seed_collection('medications', medications_data)

    print("\n\n🎉 Database seeding complete! Your application is ready with initial data.")


if __name__ == '__main__':
    # This check ensures the script runs only when executed directly
    # and not when imported.
    main()