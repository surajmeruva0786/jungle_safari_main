import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env file at the very beginning
load_dotenv()

# Handle Firestore credentials from environment (for Render deployment)
import json
import tempfile

creds_json = os.getenv('GOOGLE_APPLICATION_CREDENTIALS_JSON')
if creds_json:
    # Create temporary file for credentials
    with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as f:
        f.write(creds_json)
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = f.name
    print("✅ Using Firebase credentials from GOOGLE_APPLICATION_CREDENTIALS_JSON")

from google.cloud import firestore
import google.generativeai as genai
from google.cloud.firestore_v1.base_query import FieldFilter
from zoo_model_1762023720806 import zoo_model, AnimalMonitoringData
import cloudinary
import cloudinary.uploader
import cloudinary.api

app = Flask(__name__)
# Enable CORS to allow your React frontend to communicate with this API
CORS(app)

# --- Firestore Database Initialization ---
# The client will be initialized when the app starts.
# It relies on the GOOGLE_APPLICATION_CREDENTIALS environment variable.
credentials_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
try:
    if not credentials_path:
        raise ValueError("GOOGLE_APPLICATION_CREDENTIALS environment variable not set.")
    if not os.path.exists(credentials_path):
        raise FileNotFoundError(f"Service account key file not found at: {credentials_path}")
    
    db = firestore.Client.from_service_account_json(credentials_path)
    print("✅ Firestore client initialized successfully using service account.")
except Exception as e:
    print(f"⚠️ Error initializing Firestore client: {e}")
    print("🛑 API will run, but database functionality will be UNAVAILABLE.")
    db = None

# --- Cloudinary Initialization ---
try:
    cloudinary.config(
        cloud_name = os.environ.get("CLOUDINARY_CLOUD_NAME"),
        api_key = os.environ.get("CLOUDINARY_API_KEY"),
        api_secret = os.environ.get("CLOUDINARY_API_SECRET"),
        secure = True
    )
    if os.environ.get("CLOUDINARY_CLOUD_NAME"):
        print("✅ Cloudinary client initialized successfully.")
    else:
        print("⚠️ Cloudinary credentials not set in .env file. Media uploads will fail.")
except Exception as e:
    print(f"⚠️ Error initializing Cloudinary client: {e}")

# --- API Endpoints ---

@app.route('/')
def health_check():
    """A simple endpoint to confirm the API is running."""
    return jsonify({"status": "Jungle Safari Backend API is running!", "database_connected": db is not None})

@app.route('/animals', methods=['GET'])
def get_animals():
    """Fetches all animals from the Firestore database."""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    try:
        animals_ref = db.collection('animals')
        docs = animals_ref.stream()
        
        animals = [doc.to_dict() for doc in docs]
        return jsonify(animals), 200
    except Exception as e:
        print(f"❌ Error fetching animals: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/animals', methods=['POST'])
def create_animal():
    """Creates a new animal in the database."""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    data = request.get_json()
    if not data or 'name' not in data or 'species' not in data:
        return jsonify({"error": "Missing required animal data"}), 400
        
    try:
        animals_ref = db.collection('animals')
        # Find the highest existing number to increment it
        docs = animals_ref.order_by('id', direction=firestore.Query.DESCENDING).limit(1).stream()
        last_animal = next(docs, None)
        if last_animal:
            last_id = last_animal.id
            last_num = int(last_id.replace('A', ''))
            new_num = last_num + 1
        else:
            new_num = 1
        
        new_id = f"A{str(new_num).zfill(3)}"
        data['id'] = new_id
        data['number'] = str(new_num).zfill(3)

        animals_ref.document(new_id).set(data)
        return jsonify(data), 201
    except Exception as e:
        print(f"❌ Error creating animal: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/animals/<animal_id>', methods=['PUT'])
def update_animal(animal_id):
    """Updates an animal's details in the database."""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    data = request.get_json()
    db.collection('animals').document(animal_id).update(data)
    return jsonify({"success": True, "updated_data": data}), 200

@app.route('/users', methods=['GET'])
def get_users():
    """Fetches all users from the Firestore database."""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    try:
        users_ref = db.collection('users')
        docs = users_ref.stream()
        
        users = []
        for doc in docs:
            user_data = doc.to_dict()
            user_data['id'] = doc.id # Add the document ID to the user data
            users.append(user_data)
            
        return jsonify(users), 200
    except Exception as e:
        print(f"❌ Error fetching users: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/users', methods=['POST'])
def create_user():
    """Creates a new user in the Firestore database."""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    data = request.get_json()
    if not data or 'name' not in data or 'role' not in data:
        return jsonify({"error": "Missing user data"}), 400
        
    try:
        # The document ID will be auto-generated by Firestore
        doc_ref = db.collection('users').add(data)
        # Return the newly created user with its new ID
        new_user = data
        new_user['id'] = doc_ref[1].id
        return jsonify(new_user), 201
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Deletes a user from the Firestore database."""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    db.collection('users').document(user_id).delete()
    return jsonify({"success": True}), 200

@app.route('/login', methods=['POST'])
def login_user():
    """Authenticates a user based on name and password."""
    if not db:
        return jsonify({"error": "Database not connected"}), 500

    data = request.get_json()
    name = data.get('name')
    password = data.get('password')

    if not name or not password:
        return jsonify({"error": "Missing name or password"}), 400

    try:
        users_ref = db.collection('users')
        # Query for the user by name
        query = users_ref.where('name', '==', name).limit(1).stream()
        
        user_doc = next(query, None)

        if user_doc:
            user_data = user_doc.to_dict()
            # In a real production app, passwords should be hashed and compared.
            if user_data.get('password') == password:
                # Login successful. Don't send the password back.
                user_data.pop('password', None) 
                user_data['id'] = user_doc.id
                return jsonify(user_data), 200
            else:
                return jsonify({"error": "Incorrect password"}), 401 # Unauthorized
        else:
            return jsonify({"error": "User not found"}), 404 # Not Found
    except Exception as e:
        print(f"❌ Error during login: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/observations', methods=['GET'])
def get_observations():
    """Fetches all observation logs from the Firestore database."""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    try:
        obs_ref = db.collection('observations')
        # Order by creation date, newest first
        docs = obs_ref.order_by('createdAt', direction=firestore.Query.DESCENDING).stream()
        
        observations = []
        for doc in docs:
            obs_data = doc.to_dict()
            obs_data['id'] = doc.id
            observations.append(obs_data)
            
        return jsonify(observations), 200
    except Exception as e:
        print(f"❌ Error fetching observations: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/inventory', methods=['GET'])
def get_inventory():
    """Fetches all inventory items from the Firestore database."""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    try:
        inventory_ref = db.collection('inventory')
        docs = inventory_ref.order_by('name').stream()
        
        inventory = []
        for doc in docs:
            item_data = doc.to_dict()
            item_data['id'] = doc.id
            inventory.append(item_data)
            
        return jsonify(inventory), 200
    except Exception as e:
        print(f"❌ Error fetching inventory: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/inventory', methods=['POST'])
def create_inventory_item():
    """Creates a new inventory item."""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    data = request.get_json()
    if not data or 'name' not in data or 'category' not in data:
        return jsonify({"error": "Missing required inventory data"}), 400
        
    try:
        from datetime import datetime
        data['lastRestocked'] = datetime.utcnow().isoformat()
        doc_ref_tuple = db.collection('inventory').add(data)
        new_item = data
        new_item['id'] = doc_ref_tuple[1].id
        return jsonify(new_item), 201
    except Exception as e:
        print(f"❌ Error creating inventory item: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/inventory/<item_id>', methods=['PUT'])
def update_inventory_item(item_id):
    """Updates an inventory item."""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    data = request.get_json()
    db.collection('inventory').document(item_id).update(data)
    return jsonify({"success": True, "updated_data": data}), 200

@app.route('/inventory/<item_id>', methods=['DELETE'])
def delete_inventory_item(item_id):
    """Deletes an inventory item."""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    db.collection('inventory').document(item_id).delete()
    return jsonify({"success": True}), 200

@app.route('/medications', methods=['GET'])
def get_medications():
    """Fetches all medication items from the Firestore database."""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    try:
        meds_ref = db.collection('medications')
        docs = meds_ref.order_by('startDate', direction=firestore.Query.DESCENDING).stream()
        
        medications = []
        for doc in docs:
            med_data = doc.to_dict()
            med_data['id'] = doc.id
            medications.append(med_data)
            
        return jsonify(medications), 200
    except Exception as e:
        print(f"❌ Error fetching medications: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/medications', methods=['POST'])
def create_medication():
    """Creates a new medication prescription."""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    data = request.get_json()
    if not data or 'medicationName' not in data or 'animalId' not in data:
        return jsonify({"error": "Missing required medication data"}), 400
        
    try:
        from datetime import datetime
        data['createdAt'] = datetime.utcnow().isoformat()
        if 'administrationLog' not in data:
            data['administrationLog'] = []
        doc_ref_tuple = db.collection('medications').add(data)
        new_med = data
        new_med['id'] = doc_ref_tuple[1].id
        return jsonify(new_med), 201
    except Exception as e:
        print(f"❌ Error creating medication: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/medications/<medication_id>', methods=['PUT'])
def update_medication(medication_id):
    """Updates a medication item (e.g., status, admin log)."""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    data = request.get_json()
    db.collection('medications').document(medication_id).update(data)
    return jsonify({"success": True, "updated_data": data}), 200

@app.route('/medications/<medication_id>', methods=['DELETE'])
def delete_medication(medication_id):
    """Deletes a medication prescription."""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    db.collection('medications').document(medication_id).delete()
    return jsonify({"success": True}), 200

@app.route('/alerts', methods=['GET'])
def get_alerts():
    """Fetches all alerts from the Firestore database."""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    try:
        alerts_ref = db.collection('alerts')
        # Order by creation time, newest first
        docs = alerts_ref.order_by('createdAt', direction=firestore.Query.DESCENDING).stream()
        
        alerts = []
        for doc in docs:
            alert_data = doc.to_dict()
            alert_data['id'] = doc.id
            alerts.append(alert_data)
            
        return jsonify(alerts), 200
    except Exception as e:
        print(f"❌ Error fetching alerts: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/alerts', methods=['POST'])
def create_alert():
    """Creates a new alert (e.g., for SOS)."""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    data = request.get_json()
    if not data or 'message' not in data or 'type' not in data:
        return jsonify({"error": "Missing required alert data"}), 400
        
    try:
        from datetime import datetime
        data['createdAt'] = datetime.utcnow().isoformat()
        data['status'] = 'active' # Default status
        doc_ref_tuple = db.collection('alerts').add(data)
        return jsonify({"success": True, "id": doc_ref_tuple[1].id}), 201
    except Exception as e:
        print(f"❌ Error creating alert: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/alerts/<alert_id>', methods=['DELETE'])
def delete_alert(alert_id):
    """Deletes an alert from the Firestore database."""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    db.collection('alerts').document(alert_id).delete()
    return jsonify({"success": True}), 200

@app.route('/feeding_records', methods=['GET'])
def get_feeding_records():
    """Fetches all feeding records from the Firestore database."""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    try:
        records_ref = db.collection('feeding_records')
        docs = records_ref.order_by('recordedAt', direction=firestore.Query.DESCENDING).stream()
        
        records = []
        for doc in docs:
            record_data = doc.to_dict()
            record_data['id'] = doc.id
            records.append(record_data)
            
        return jsonify(records), 200
    except Exception as e:
        print(f"❌ Error fetching feeding records: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/feeding_records', methods=['POST'])
def create_feeding_record():
    """Creates a new feeding record."""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    data = request.get_json()
    if not data or 'animalId' not in data or 'feedType' not in data:
        return jsonify({"error": "Missing required feeding record data"}), 400
        
    try:
        from datetime import datetime
        data['recordedAt'] = datetime.utcnow().isoformat()
        doc_ref_tuple = db.collection('feeding_records').add(data)
        new_record = data
        new_record['id'] = doc_ref_tuple[1].id
        return jsonify(new_record), 201
    except Exception as e:
        print(f"❌ Error creating feeding record: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/feeding_records/<record_id>', methods=['PUT'])
def update_feeding_record(record_id):
    """Updates a feeding record (e.g., status)."""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    data = request.get_json()
    db.collection('feeding_records').document(record_id).update(data)
    return jsonify({"success": True, "updated_data": data}), 200

@app.route('/upload_media', methods=['POST'])
def upload_media():
    """Uploads a media file to Cloudinary and returns its public URL."""
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected for uploading"}), 400

    try:
        # Upload to Cloudinary, letting it auto-detect the resource type (image/video)
        upload_result = cloudinary.uploader.upload(
            file,
            resource_type="auto"
        )
        # Return the secure URL provided by Cloudinary
        return jsonify({"url": upload_result['secure_url']}), 200

    except Exception as e:
        print(f"❌ Error uploading to Cloudinary: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/process_text_observation', methods=['POST'])
def process_text_observation():
    """
    Processes a multipart form submission containing log data and media files.
    Uploads files to Cloudinary and uses AI to structure the text observation.
    """
    import json
    from datetime import datetime

    # --- Extract Data ---
    if 'logData' not in request.form:
        return jsonify({"error": "Missing logData in form"}), 400
    
    data = json.loads(request.form['logData'])
    observation_text = data.get('observationText', '')
    animal_id = data.get('animalId', '')
    
    if not observation_text:
        return jsonify({"error": "Missing observation text"}), 400

    # --- Media File Upload ---
    # Upload files and add URLs directly to data with correct field names
    if 'gateImage' in request.files:
        file = request.files['gateImage']
        if file.filename:
            try:
                upload_result = cloudinary.uploader.upload(file, resource_type="auto")
                data['gateImageUrl'] = upload_result['secure_url']
                print(f"✅ Successfully uploaded gateImage to Cloudinary.")
            except Exception as e:
                print(f"⚠️ Cloudinary upload failed for gateImage: {e}")
    
    if 'animalImage' in request.files:
        file = request.files['animalImage']
        if file.filename:
            try:
                upload_result = cloudinary.uploader.upload(file, resource_type="auto")
                data['imageUrl'] = upload_result['secure_url']  # LogHistory expects 'imageUrl'
                print(f"✅ Successfully uploaded animalImage to Cloudinary.")
            except Exception as e:
                print(f"⚠️ Cloudinary upload failed for animalImage: {e}")
    
    if 'animalVideo' in request.files:
        file = request.files['animalVideo']
        if file.filename:
            try:
                upload_result = cloudinary.uploader.upload(file, resource_type="video")
                data['videoUrl'] = upload_result['secure_url']  # LogHistory expects 'videoUrl'
                print(f"✅ Successfully uploaded animalVideo to Cloudinary.")
            except Exception as e:
                print(f"⚠️ Cloudinary upload failed for animalVideo: {e}")

    # --- AI Processing ---
    animal_name = "Unknown"
    if db and animal_id:
        try:
            animal_doc = db.collection('animals').document(animal_id).get()
            if animal_doc.exists:
                animal_name = animal_doc.to_dict().get('name', 'Unknown')
        except Exception as e:
            print(f"⚠️ Could not fetch animal name for ID {animal_id}: {e}")

    try:
        # Store the original observation text before AI processing
        original_observation_text = observation_text
        
        ai_summary = zoo_model.process_observation(observation_text, data['createdAt'], animal_name)
        
        # Merge AI summary fields directly into data (not nested)
        ai_data = ai_summary.model_dump()
        data.update(ai_data)  # This merges AI fields directly into the main data object
        
        # Preserve the original observation text (AI model doesn't return this)
        data['observationText'] = original_observation_text

        # --- Automatic Sharing with Admins and Vets ---
        try:
            # key: sharedWith is a list of user IDs
            if 'sharedWith' not in data:
                data['sharedWith'] = []
            
            # Fetch admins and vets
            # Note: In a large system, you might cache this or do it differently.
            admins = db.collection('users').where('role', '==', 'admin').stream()
            vets = db.collection('users').where('role', '==', 'vet').stream()
            
            for user in admins:
                if user.id not in data['sharedWith']:
                    data['sharedWith'].append(user.id)
            
            for user in vets:
                if user.id not in data['sharedWith']:
                    data['sharedWith'].append(user.id)
                    
            print(f"✅ Automatically shared log with {len(data['sharedWith'])} recipients (Admins/Vets).")
        except Exception as share_e:
            print(f"⚠️ Failed to auto-share log: {share_e}")

        # --- Automatic Alert Generation ---
        # If health status is 'poor', create a high-priority alert
        if data.get('healthStatus') == 'poor' and db:
            try:
                alert_payload = {
                    'type': 'health',
                    'animalName': animal_name,
                    'message': f"Health status marked as 'poor' for {animal_name}. Immediate attention required.",
                    'location': data.get('enclosure', 'N/A'), # Assuming enclosure might be in data
                    'status': 'active',
                    'createdAt': datetime.utcnow().isoformat(),
                    'createdBy': 'System (Auto-generated)'
                }
                db.collection('alerts').add(alert_payload)
                print(f"✅ Auto-generated health alert for {animal_name}.")
            except Exception as alert_e:
                print(f"⚠️ Failed to auto-generate health alert: {alert_e}")

        # Save to Firestore if the client is available
        if db:
            doc_ref_tuple = db.collection('observations').add(data)
            doc_id = doc_ref_tuple[1].id
            data['id'] = doc_id  # Add the document ID to the response
            print(f"✅ Data saved to Firestore with ID: {doc_id}")

            # Update Animal's lastChecked field
            if animal_id:
                try:
                    now = datetime.now()
                    update_data = {'lastChecked': now.isoformat()}
                    
                    if now.hour < 14:
                        update_data['lastMorningCheck'] = now.isoformat()
                        print(f"✅ Updated Morning Check for animal {animal_id}")
                    else:
                        update_data['lastEveningCheck'] = now.isoformat()
                        print(f"✅ Updated Evening Check for animal {animal_id}")

                    db.collection('animals').document(animal_id).update(update_data)
                except Exception as update_e:
                    print(f"⚠️ Failed to update animal stamps: {update_e}")

        return jsonify(data), 200
    except Exception as e:
        print(f"❌ Error processing text observation: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/transcribe_audio', methods=['POST'])
def transcribe_audio():
    """Transcribes an audio file and returns the text."""
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']
    content_type = audio_file.mimetype # Get the actual mimetype
    audio_bytes = audio_file.read()

    try:
        # Use the AI model's transcription method
        transcript = zoo_model.transcribe_audio(audio_bytes, content_type)
        if transcript.startswith("Error") or transcript.startswith("Audio transcription unavailable"):
            return jsonify({"error": transcript}), 500

        return jsonify({"transcript": transcript}), 200
    except Exception as e:
        print(f"❌ Error transcribing audio: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/process_audio_observation', methods=['POST'])
def process_audio_observation():
    """Processes an audio observation, transcribes it, and stores it in Firestore."""
    from datetime import datetime
    
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']
    date = request.form.get('date')
    content_type = audio_file.mimetype # Get the actual mimetype
    prefix = request.form.get('prefix', '') # Get optional prefix
    animal_id = request.form.get('animalId', '')
    submitted_by = request.form.get('submittedBy', '')  # Get submitter ID
    submitted_by_name = request.form.get('submittedByName', '')  # Get submitter name

    if not date:
        return jsonify({"error": "Missing 'date' in request form data"}), 400

    audio_bytes = audio_file.read()
    zoo_model.prefix = prefix # Set prefix on the model instance

    animal_name = "Unknown"
    if db and animal_id:
        try:
            animal_doc = db.collection('animals').document(animal_id).get()
            if animal_doc.exists:
                animal_name = animal_doc.to_dict().get('name', 'Unknown')
        except Exception as e:
            print(f"⚠️ Could not fetch animal name for ID {animal_id}: {e}")

    try:
        # First, transcribe the audio to get the raw text
        transcribed_text = zoo_model.transcribe_audio(audio_bytes, content_type)
        print(f"📝 Transcribed text: {transcribed_text}")
        
        # Set the prefix and process with AI
        zoo_model.prefix = prefix
        
        # Use the AI model to transcribe and process the audio
        structured_data: AnimalMonitoringData = zoo_model.process_audio_observation(audio_bytes, date, content_type, animal_name)
        data_dict = structured_data.model_dump()
        
        # Add the raw transcribed text to the response so frontend can display it
        data_dict['transcribedText'] = transcribed_text
        data_dict['fullObservationText'] = prefix + transcribed_text
        
        # Add submitter information
        if submitted_by:
            data_dict['submittedBy'] = submitted_by
        if submitted_by_name:
            data_dict['submittedByName'] = submitted_by_name

        # Save to Firestore if the client is available
        if db:
            doc_ref_tuple = db.collection('observations').add(data_dict)
            doc_ref = doc_ref_tuple[1]
            doc_id = doc_ref.id
            data_dict['id'] = doc_id  # Add the document ID to the response
            print(f"✅ Data saved to Firestore with ID: {doc_id}")

            # Update Animal's lastChecked field
            if animal_id:
                try:
                    now = datetime.now()
                    update_data = {'lastChecked': now.isoformat()}
                    
                    if now.hour < 14:
                        update_data['lastMorningCheck'] = now.isoformat()
                        print(f"✅ Updated Morning Check for animal {animal_id} (Audio)")
                    else:
                        update_data['lastEveningCheck'] = now.isoformat()
                        print(f"✅ Updated Evening Check for animal {animal_id} (Audio)")

                    db.collection('animals').document(animal_id).update(update_data)
                except Exception as update_e:
                    print(f"⚠️ Failed to update animal stamps: {update_e}")

        return jsonify(data_dict), 200
    except Exception as e:
        print(f"❌ Error processing audio observation: {e}")
        return jsonify({"error": str(e)}), 500

# ==================== MESSAGES API (Task 4: Communication System) ====================


@app.route('/messages', methods=['POST'])
def create_message():
    """Create a new message"""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    data = request.get_json()
    if not data or 'content' not in data:
        return jsonify({"error": "Missing required message data"}), 400
    
    try:
        from datetime import datetime
        
        message_data = {
            'senderId': data.get('senderId'),
            'senderName': data.get('senderName'),
            'senderRole': data.get('senderRole'),
            'recipientType': data.get('recipientType', 'everyone'),
            'recipientId': data.get('recipientId'),
            'recipientRole': data.get('recipientRole'),
            'content': data.get('content'),
            'type': data.get('type', 'message'),
            'priority': data.get('priority', 'normal'),
            'createdAt': datetime.now().isoformat(),
            'readBy': []
        }
        
        # Add to Firestore
        doc_ref = db.collection('messages').add(message_data)
        message_data['id'] = doc_ref[1].id
        
        print(f"✅ Message created with ID: {message_data['id']}")
        return jsonify({"success": True, "message": message_data}), 201
    except Exception as e:
        print(f"❌ Error creating message: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/messages', methods=['GET'])
def get_messages():
    """Get messages for current user"""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    try:
        user_id = request.args.get('userId')
        user_role = request.args.get('role')
        
        messages_ref = db.collection('messages')
        docs = messages_ref.stream()
        
        all_messages = []
        for doc in docs:
            msg = doc.to_dict()
            msg['id'] = doc.id
            
            # Filter based on recipient or sender
            if (msg.get('senderId') == user_id or
                msg.get('recipientType') == 'everyone' or
                (msg.get('recipientType') == 'individual' and msg.get('recipientId') == user_id) or
                (msg.get('recipientType') == 'role' and msg.get('recipientRole') == user_role)):
                all_messages.append(msg)
        
        # Sort by creation date (newest first)
        all_messages.sort(key=lambda x: x.get('createdAt', ''), reverse=True)
        
        return jsonify({"messages": all_messages}), 200
    except Exception as e:
        print(f"❌ Error fetching messages: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/messages/<message_id>/read', methods=['PUT'])
def mark_message_read(message_id):
    """Mark a message as read"""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    data = request.get_json()
    user_id = data.get('userId')
    
    if not user_id:
        return jsonify({"error": "Missing userId"}), 400
    
    try:
        msg_ref = db.collection('messages').document(message_id)
        msg_doc = msg_ref.get()
        
        if not msg_doc.exists:
            return jsonify({"error": "Message not found"}), 404
        
        msg_data = msg_doc.to_dict()
        read_by = msg_data.get('readBy', [])
        
        if user_id not in read_by:
            read_by.append(user_id)
            msg_ref.update({'readBy': read_by})
        
        return jsonify({"success": True, "message": "Message marked as read"}), 200
    except Exception as e:
        print(f"❌ Error marking message as read: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/messages/<message_id>', methods=['DELETE'])
def delete_message(message_id):
    """Delete a message (Admin only)"""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    try:
        db.collection('messages').document(message_id).delete()
        return jsonify({"success": True, "message": "Message deleted"}), 200
    except Exception as e:
        print(f"❌ Error deleting message: {e}")
        return jsonify({"error": str(e)}), 500

# ==================== HOSPITAL RECORDS API (Task 9: Hospital Records) ====================

@app.route('/hospital-records', methods=['POST'])
def create_hospital_record():
    """Create a new hospital record"""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    data = request.get_json()
    if not data or 'animalId' not in data or 'observation' not in data:
        return jsonify({"error": "Missing required fields: animalId and observation"}), 400
    
    try:
        from datetime import datetime
        
        record_data = {
            'animalId': data.get('animalId'),
            'date': data.get('date'),
            'observation': data.get('observation'),
            'testsConducted': data.get('testsConducted', ''),
            'dosageTreatment': data.get('dosageTreatment', ''),
            'remarks': data.get('remarks', ''),
            'status': data.get('status', 'ongoing'),
            'vetId': data.get('vetId'),
            'vetName': data.get('vetName'),
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }
        
        # Add to Firestore
        doc_ref = db.collection('hospital_records').add(record_data)
        record_data['id'] = doc_ref[1].id
        
        print(f"✅ Hospital record created with ID: {record_data['id']}")
        return jsonify({"success": True, "record": record_data}), 201
    except Exception as e:
        print(f"❌ Error creating hospital record: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/hospital-records', methods=['GET'])
def get_hospital_records():
    """Get hospital records (all or filtered by animalId query param)"""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    try:
        animal_id = request.args.get('animalId')
        
        records_ref = db.collection('hospital_records')
        
        if animal_id:
            records_ref = records_ref.where('animalId', '==', animal_id)
            
        docs = records_ref.stream()
        
        records = []
        for doc in docs:
            record = doc.to_dict()
            record['id'] = doc.id
            records.append(record)
        
        # Sort by date (newest first)
        records.sort(key=lambda x: x.get('date', ''), reverse=True)
        
        return jsonify({"records": records}), 200
    except Exception as e:
        print(f"❌ Error fetching hospital records: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/hospital-records/animal/<animal_id>', methods=['GET'])
def get_hospital_records_by_animal(animal_id):
    """Get hospital records for a specific animal"""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
        
    try:
        records_ref = db.collection('hospital_records').where('animalId', '==', animal_id)
        docs = records_ref.stream()
        
        records = []
        for doc in docs:
            record = doc.to_dict()
            record['id'] = doc.id
            records.append(record)
            
        records.sort(key=lambda x: x.get('date', ''), reverse=True)
        
        return jsonify({"records": records}), 200
    except Exception as e:
        print(f"❌ Error fetching hospital records: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/hospital-records/<record_id>', methods=['PUT'])
def update_hospital_record(record_id):
    """Update a hospital record"""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    data = request.get_json()
    
    try:
        from datetime import datetime
        
        record_ref = db.collection('hospital_records').document(record_id)
        record_doc = record_ref.get()
        
        if not record_doc.exists:
            return jsonify({"error": "Record not found"}), 404
        
        update_data = {}
        if 'observation' in data:
            update_data['observation'] = data['observation']
        if 'testsConducted' in data:
            update_data['testsConducted'] = data['testsConducted']
        if 'dosageTreatment' in data:
            update_data['dosageTreatment'] = data['dosageTreatment']
        if 'remarks' in data:
            update_data['remarks'] = data['remarks']
        if 'status' in data:
            update_data['status'] = data['status']
        
        update_data['updatedAt'] = datetime.now().isoformat()
        
        record_ref.update(update_data)
        
        # Get updated record
        updated_doc = record_ref.get()
        updated_record = updated_doc.to_dict()
        updated_record['id'] = record_id
        
        return jsonify({"success": True, "record": updated_record}), 200
    except Exception as e:
        print(f"❌ Error updating hospital record: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/hospital-records/<record_id>', methods=['DELETE'])
def delete_hospital_record(record_id):
    """Delete a hospital record"""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    try:
        db.collection('hospital_records').document(record_id).delete()
        return jsonify({"success": True, "message": "Record deleted"}), 200
    except Exception as e:
        print(f"❌ Error deleting hospital record: {e}")
        return jsonify({"error": str(e)}), 500






@app.route('/logs/by-zookeeper', methods=['GET'])
def get_logs_by_zookeeper():
    """Get aggregated logs by zookeeper"""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
    
    try:
        # 1. Fetch all Zookeepers first
        users_ref = db.collection('users').where('role', '==', 'zookeeper')
        users_docs = users_ref.stream()
        
        zookeeper_stats = {}
        for doc in users_docs:
            user_data = doc.to_dict()
            user_id = doc.id
            zookeeper_stats[user_id] = {
                'id': user_id,
                'name': user_data.get('name', 'Unknown'),
                'todayLogs': 0,
                'weekLogs': 0,
                'lastSubmission': None,
                'assignedAnimals': set(),
                'morningSubmitted': False,
                'eveningSubmitted': False
            }

        # 2. Fetch observations
        docs = db.collection('observations').order_by('createdAt', direction=firestore.Query.DESCENDING).limit(500).stream()
        
        from datetime import datetime, timedelta
        now = datetime.now()
        start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
        start_of_week = start_of_day - timedelta(days=now.weekday())
        
        for doc in docs:
            data = doc.to_dict()
            user_id = data.get('userId')
            
            if not user_id:
                continue
            
            if user_id in zookeeper_stats:
                stats = zookeeper_stats[user_id]
                created_at_str = data.get('createdAt')
                
                # Update Last Submission
                if not stats['lastSubmission']:
                     stats['lastSubmission'] = created_at_str
                
                # Parse Date
                try:
                    created_at = datetime.fromisoformat(created_at_str.replace('Z', '+00:00'))
                    
                    # Check Today
                    if created_at.replace(tzinfo=None) >= start_of_day:
                        stats['todayLogs'] += 1
                        
                        # Check Morning/Evening
                        hour = created_at.hour
                        if 6 <= hour < 12:
                            stats['morningSubmitted'] = True
                        elif 16 <= hour < 20:
                            stats['eveningSubmitted'] = True

                    # Check Week
                    if created_at.replace(tzinfo=None) >= start_of_week:
                        stats['weekLogs'] += 1
                except:
                    pass
                
                # Animals
                animal_name = data.get('animalName')
                if animal_name:
                    stats['assignedAnimals'].add(animal_name)
        
        # Format for response
        result = []
        for stats in zookeeper_stats.values():
            stats['assignedAnimals'] = list(stats['assignedAnimals']) # Convert set to list
            result.append(stats)
            
        return jsonify({"zookeepers": result}), 200
        
    except Exception as e:
        print(f"❌ Error aggregating zookeeper logs: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/logs/zookeeper/<user_id>', methods=['GET'])
def get_zookeeper_logs(user_id):
    """Get all logs for a specific zookeeper"""
    if not db:
        return jsonify({"error": "Database not connected"}), 500
        
    try:
        docs = db.collection('observations').where('userId', '==', user_id).order_by('createdAt', direction=firestore.Query.DESCENDING).stream()
        
        logs = []
        for doc in docs:
            data = doc.to_dict()
            logs.append({
                'id': doc.id,
                'animalId': data.get('animalId', ''),
                'animalName': data.get('animalName', 'Unknown'),
                'submittedAt': data.get('createdAt', ''),
                'healthStatus': data.get('healthStatus', 'good'),
                'observations': data.get('observationText', '') or data.get('observation', ''), 
                'processedData': data,
                'moodPercentage': data.get('moodPercentage'),
                'appetitePercentage': data.get('appetitePercentage'),
                'movementPercentage': data.get('movementPercentage'),
            })
            
        return jsonify({"logs": logs}), 200
    except Exception as e:
        print(f"❌ Error fetching zookeeper logs: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # --- API Key Configuration ---
    # IMPORTANT: Set your API keys as environment variables for security.
    # Do not hardcode them here in a production environment.
    
    # For local development, you can uncomment and set them, but it's better to use your shell:
    # export DEEPGRAM_API_KEY="your_key"
    # export GEMINI_API_KEY="your_key"
    # export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json" # This should be in .env now

    if not os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
        print("⚠️ WARNING: GOOGLE_APPLICATION_CREDENTIALS environment variable not set. Firestore connection will fail. Ensure it's in your .env file or set in your environment.")

    port = int(os.environ.get('PORT', 8080))
    app.run(debug=True, host='0.0.0.0', port=port)
