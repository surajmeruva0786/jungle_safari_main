import os
import requests
from typing import Optional
from pydantic import BaseModel, Field
from langchain.prompts import PromptTemplate
from langchain.output_parsers import PydanticOutputParser
import google.generativeai as genai

# ----------------------------
# Schema for structured data - NEW COMPREHENSIVE FORMAT
# ----------------------------
class AnimalMonitoringData(BaseModel):
    # Metadata
    date_or_day: str = Field(..., description="Date or day of observation")
    incharge_signature: str = Field(..., description="Signature of caretaker or in-charge")
    
    # ========== SECTION A: DAILY ANIMAL HEALTH (GENERAL) REPORTING ==========
    
    # 1. Feeding & Drinking
    feed_consumption_percentage: str = Field(..., description="Feed consumption: 25%, 50%, 75%, or 100%")
    feed_quantity_consumed: str = Field(..., description="Quantity consumed in kg or litres")
    water_consumption_normal: bool = Field(..., description="Did the animal drink water normally?")
    digestion_problem: bool = Field(..., description="Any vomiting, diarrhoea, or digestion problem?")
    digestion_problem_details: str | None = Field(None, description="Details of digestion problem if any")
    
    # 2. Health & Physical Condition
    injury_or_illness_noticed: bool = Field(..., description="Any injury, swelling, wound, discharge, limping, or illness?")
    animal_weak_or_lethargic: bool = Field(..., description="Did the animal appear weak, lethargic, or uncomfortable?")
    health_problem_details: str | None = Field(None, description="Details of health problems if any")
    
    # 3. Behaviour & Activity Level
    activity_level: str = Field(..., description="Activity level: More active, Normal, Less active, or Very dull")
    alert_and_responsive: bool = Field(..., description="Was the animal alert and responsive?")
    
    # 4. Reproductive Status
    reproductive_signs_observed: bool = Field(..., description="Any mating, heat, pregnancy, or birth signs?")
    reproductive_signs_description: str | None = Field(None, description="Description of reproductive signs if any")
    
    # 5. Mortality / Critical Condition
    critical_condition_observed: bool = Field(..., description="Any death, serious injury, or critical illness?")
    critical_condition_details: str | None = Field(None, description="Details of critical condition if any")
    
    # 6. Hygiene, Pest & Safety Check
    pests_noticed: bool = Field(..., description="Were flies, rodents, insects, or pests noticed?")
    safety_risks_noticed: bool = Field(..., description="Any broken fence, sharp object, or safety risk?")
    safety_risk_details: str | None = Field(None, description="Details of safety risks if any")
    
    # 7. Additional Observations / Remarks
    additional_observations: str | None = Field(None, description="Any unusual, important, or noteworthy observations")
    
    # ========== ENCLOSURE (GENERAL) REPORT ==========
    
    # 1. Overall Cleanliness & Waste Management
    enclosure_cleaning_time: Optional[str] = Field(None, description="Time when enclosure was cleaned (e.g., '7:00 AM'), or null if not mentioned")
    waste_removed_properly: bool = Field(..., description="Was waste removed and water area cleaned properly?")
    waste_removal_issue: str | None = Field(None, description="Reason if waste not removed properly")
    
    # 2. Water & Sanitation
    water_trough_cleaned: bool = Field(..., description="Was the water trough cleaned today?")
    fresh_water_available: bool = Field(..., description="Was fresh and sufficient water available?")
    
    # 3. Fencing, Cages & Locking Systems Check
    fencing_secure_and_functioning: bool = Field(..., description="Were all fences, cages, doors, and locks secure?")
    fencing_issue_details: str | None = Field(None, description="Details of fencing/locking issues if any")
    
    # 4. Moat & Physical Barrier Condition
    moat_condition: str = Field(..., description="Moat condition: Dry, Wet, Partially Filled, or Not Applicable")
    
    # 5. Pest, Vector & Hygiene Control
    enclosure_pests_noticed: bool = Field(..., description="Were flies, mosquitoes, rodents, or insects noticed?")
    
    # 6. Staff Uniform, Attendance & Health Status
    staff_attendance_complete: bool = Field(..., description="Was staff attendance complete?")
    
    # 7. Final Safety Verification
    all_secured_before_closing: bool = Field(..., description="Were all cells, cages, and gates secured before closing?")
    
    # 8. Remarks / Follow-up Required
    enclosure_remarks: str | None = Field(None, description="Any unusual observation, pending repair, or urgent action required")


# ----------------------------
# Zoo AI Model with Deepgram
# ----------------------------
class ZooAIModel:
    def __init__(self):
        """Initialize Gemini LLM and Deepgram API."""
        # Gemini LLM
        gem_key = os.environ.get("GEMINI_API_KEY")
        if gem_key:
            genai.configure(api_key=gem_key)
            self.llm = genai.GenerativeModel("gemini-pro")  # Using stable gemini-pro model
        else:
            self.llm = None

        # Deepgram API
        self.deepgram_key = os.environ.get("DEEPGRAM_API_KEY") # Keep for checking if key exists
        self.deepgram_url = "https://api.deepgram.com/v1/listen"
        self.prefix = "" # Add a prefix attribute

        # Parser & prompt
        self.parser = PydanticOutputParser(pydantic_object=AnimalMonitoringData)
        self.prompt = PromptTemplate(
            template="""
You are an expert zoo monitoring assistant. Your task is to analyze an observation log
for a specific animal and convert it into a structured JSON format based on the NEW COMPREHENSIVE FORMAT.

**Animal Being Observed:** {animal_name}
**Date of Observation:** {date}

**NEW FORMAT - EXTRACT THE FOLLOWING:**

SECTION A: DAILY ANIMAL HEALTH (GENERAL) REPORTING

1. Feeding & Drinking:
   - feed_consumption_percentage: How much feed consumed? (25%, 50%, 75%, or 100%)
   - feed_quantity_consumed: Quantity in kg or litres
   - water_consumption_normal: Did animal drink normally? (true/false)
   - digestion_problem: Any vomiting/diarrhoea/digestion issue? (true/false)
   - digestion_problem_details: Details if yes

2. Health & Physical Condition:
   - injury_or_illness_noticed: Any injury/swelling/wound/discharge/limping/illness? (true/false)
   - animal_weak_or_lethargic: Weak/lethargic/uncomfortable? (true/false)
   - health_problem_details: Details if yes

3. Behaviour & Activity Level:
   - activity_level: "More active", "Normal", "Less active", or "Very dull"
   - alert_and_responsive: Was animal alert? (true/false)

4. Reproductive Status:
   - reproductive_signs_observed: Any mating/heat/pregnancy/birth signs? (true/false)
   - reproductive_signs_description: Description if yes

5. Mortality / Critical Condition:
   - critical_condition_observed: Any death/serious injury/critical illness? (true/false)
   - critical_condition_details: Details if yes

6. Hygiene, Pest & Safety Check:
   - pests_noticed: Flies/rodents/insects/pests? (true/false)
   - safety_risks_noticed: Broken fence/sharp object/safety risk? (true/false)
   - safety_risk_details: Details if yes

7. Additional Observations:
   - additional_observations: Any unusual/important/noteworthy observations

ENCLOSURE (GENERAL) REPORT

1. Cleanliness & Waste:
   - enclosure_cleaning_time: Time when cleaned (e.g., "7:00 AM")
   - waste_removed_properly: Waste removed properly? (true/false)
   - waste_removal_issue: Reason if not removed properly

2. Water & Sanitation:
   - water_trough_cleaned: Trough cleaned? (true/false)
   - fresh_water_available: Fresh water available? (true/false)

3. Fencing & Locking:
   - fencing_secure_and_functioning: All secure and functioning? (true/false)
   - fencing_issue_details: Issue details if not secure

4. Moat Condition:
   - moat_condition: "Dry", "Wet", "Partially Filled", or "Not Applicable"

5. Pest Control:
   - enclosure_pests_noticed: Pests in enclosure? (true/false)

6. Staff Status:
   - staff_attendance_complete: Attendance complete? (true/false)

7. Final Safety:
   - all_secured_before_closing: All secured before closing? (true/false)

8. Remarks:
   - enclosure_remarks: Unusual observations/pending repairs/urgent actions

METADATA:
- date_or_day: Extract date from observation or use {date}
- incharge_signature: Extract zookeeper name or use "Zookeeper"

**CRITICAL INSTRUCTIONS:**
1. Read observation text VERY CAREFULLY (may be Hindi, English, or mixed)
2. EXTRACT SPECIFIC DETAILS - do NOT make generic assumptions
3. For boolean fields: Look for evidence in text. If not mentioned, use reasonable defaults:
   - water_consumption_normal: true (unless problem mentioned)
   - digestion_problem: false (unless mentioned)
   - injury_or_illness_noticed: false (unless mentioned)
   - animal_weak_or_lethargic: false (unless mentioned)
   - alert_and_responsive: true (unless problem mentioned)
   - reproductive_signs_observed: false (unless mentioned)
   - critical_condition_observed: false (unless mentioned)
   - pests_noticed: false (unless mentioned)
   - safety_risks_noticed: false (unless mentioned)
   - waste_removed_properly: true (unless problem mentioned)
   - water_trough_cleaned: true (unless problem mentioned)
   - fresh_water_available: true (unless problem mentioned)
   - fencing_secure_and_functioning: true (unless problem mentioned)
   - enclosure_pests_noticed: false (unless mentioned)
   - staff_attendance_complete: true (unless problem mentioned)
   - all_secured_before_closing: true (unless problem mentioned)

4. For percentage/choice fields:
   - feed_consumption_percentage: Estimate from text (25%, 50%, 75%, 100%)
   - activity_level: Determine from description (More active/Normal/Less active/Very dull)
   - moat_condition: Extract or use "Not Applicable"

5. Extract ACTUAL names, times, quantities from text
6. Return ONLY valid JSON. No extra text or markdown.

{format_instructions}

Observation Text: {observation}
            """,
            input_variables=["observation", "animal_name", "date"],
            partial_variables={"format_instructions": self.parser.get_format_instructions()},
        )

    # ----------------------------
    # Deepgram Transcription
    # ----------------------------
    def transcribe_audio(self, audio_bytes, content_type="audio/webm"):
        """Transcribe audio using Deepgram API with Groq Whisper fallback."""
        transcript = ""
        
        # Try Deepgram first
        if self.deepgram_key:
            try:
                print(f"🎤 Trying Deepgram transcription: {len(audio_bytes)} bytes, type: {content_type}")
                headers = {
                    "Authorization": f"Token {self.deepgram_key}",
                    "Content-Type": content_type
                }
                params = {
                    "model": "nova-2",
                    "language": "hi",  # Hindi language
                    "detect_language": "true",  # Auto-detect Hindi/English
                }
                response = requests.post(
                    self.deepgram_url, headers=headers, params=params, data=audio_bytes, timeout=60
                )
                
                print(f"📡 Deepgram response status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"📄 Deepgram full response: {result}")
                    
                    transcript = result.get("results", {}).get("channels", [{}])[0].get("alternatives", [{}])[0].get("transcript", "")
                    
                    if transcript:
                        print(f"✅ Deepgram transcript: '{transcript}'")
                        return transcript
                    else:
                        print("⚠️ Deepgram returned empty transcript (audio may be silent or too short)")
                else:
                    print(f"⚠️ Deepgram failed with status {response.status_code}")
            except Exception as e:
                print(f"⚠️ Deepgram error: {e}")
        
        # Try Groq Whisper as fallback
        groq_key = os.environ.get("GROQ_API_KEY")
        if groq_key and not transcript:
            try:
                print("🔄 Trying Groq Whisper as fallback...")
                from groq import Groq
                import io
                
                # Initialize Groq client (newer version doesn't need proxies parameter)
                client = Groq(api_key=groq_key)
                
                # Convert bytes to file-like object
                audio_file = io.BytesIO(audio_bytes)
                audio_file.name = "audio.webm"
                
                # Create transcription
                transcription = client.audio.transcriptions.create(
                    file=("audio.webm", audio_file),
                    model="whisper-large-v3",
                    language="hi",  # Hindi
                    response_format="text"
                )
                
                transcript = transcription if isinstance(transcription, str) else str(transcription)
                
                if transcript:
                    print(f"✅ Groq Whisper transcript: '{transcript}'")
                    return transcript
                else:
                    print("⚠️ Groq also returned empty transcript")
            except Exception as e:
                print(f"⚠️ Groq Whisper error: {e}")

        
        # If both failed or returned empty
        if not transcript:
            return "No speech detected in audio. Please ensure microphone is working and speak clearly."
        
        return transcript


    # ----------------------------
    # AI Processing with Gemini (Service Account)
    # ----------------------------
    def process_observation(self, observation_text, date, animal_name="Unknown"):
        """Convert text observation into structured data using AI."""
        try:
            enhanced_observation = f"Date: {date}\nObservation: {observation_text}"
            
            # Try Groq first (fastest and highest rate limits)
            groq_api_key = os.environ.get("GROQ_API_KEY")
            if groq_api_key:
                import requests
                
                url = "https://api.groq.com/openai/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {groq_api_key}",
                    "Content-Type": "application/json"
                }
                
                prompt_text = self.prompt.format(observation=enhanced_observation, animal_name=animal_name, date=date)
                
                payload = {
                    "model": "llama-3.3-70b-versatile",  # Fast and accurate model
                    "messages": [
                        {"role": "system", "content": "You are an expert zoo monitoring assistant. Return only valid JSON."},
                        {"role": "user", "content": prompt_text}
                    ],
                    "temperature": 0.3,
                    "max_tokens": 1000
                }
                
                response = requests.post(url, json=payload, headers=headers, timeout=30)
                response.raise_for_status()
                
                result_data = response.json()
                json_text = result_data.get("choices", [{}])[0].get("message", {}).get("content", "")
                
                result = self.parser.parse(json_text)
                
                if hasattr(result, "date_or_day"):
                    result.date_or_day = date

                return result
            
            # Try service account (Gemini) as fallback
            service_account_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
            api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("OPENAI_API_KEY") or os.environ.get("HUGGINGFACE_API_KEY")
            
            if service_account_json:
                # Use service account authentication
                import json
                import requests
                from google.oauth2 import service_account
                from google.auth.transport.requests import Request
                
                # Parse service account credentials
                credentials_dict = json.loads(service_account_json)
                credentials = service_account.Credentials.from_service_account_info(
                    credentials_dict,
                    scopes=['https://www.googleapis.com/auth/generative-language']
                )
                
                # Get access token
                credentials.refresh(Request())
                access_token = credentials.token
                
                # Using gemini-2.5-flash-lite (best free tier availability in 2025)
                url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent"
                
                headers = {
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "contents": [{
                        "parts": [{
                            "text": self.prompt.format(observation=enhanced_observation, animal_name=animal_name, date=date)
                        }]
                    }]
                }
                
                response = requests.post(url, json=payload, headers=headers, timeout=30)
                response.raise_for_status()
                
                result_data = response.json()
                json_text = result_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                
                result = self.parser.parse(json_text)
                
                if hasattr(result, "date_or_day"):
                    result.date_or_day = date

                return result
                
            elif api_key:
                # Fallback to API key authentication
                import requests
                
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={api_key}"
                
                headers = {"Content-Type": "application/json"}
                payload = {
                    "contents": [{
                        "parts": [{
                            "text": self.prompt.format(observation=enhanced_observation, animal_name=animal_name, date=date)
                        }]
                    }]
                }
                
                response = requests.post(url, json=payload, headers=headers, timeout=30)
                response.raise_for_status()
                
                result_data = response.json()
                json_text = result_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                
                result = self.parser.parse(json_text)
                
                if hasattr(result, "date_or_day"):
                    result.date_or_day = date

                return result
            else:
                print("No authentication found, using fallback data")
                return self._create_fallback_data(observation_text, date)

        except Exception as e:
            print(f"Error processing observation with AI: {e}")
            print("Using fallback data instead")
            return self._create_fallback_data(observation_text, date)



    def process_audio_observation(self, audio_bytes, date, content_type="audio/webm", animal_name="Unknown"):
        """Transcribe audio and process observation."""
        text = self.transcribe_audio(audio_bytes, content_type)
        full_text = self.prefix + text
        if text.startswith("Error") or text.startswith("Audio transcription unavailable"):
            return self._create_fallback_data(text, date)
        return self.process_observation(full_text, date, animal_name)

    # ----------------------------
    # Fallback Data
    # ----------------------------
    def _create_fallback_data(self, observation_text, date):
        """Return fallback structured data if LLM or transcription fails."""
        return AnimalMonitoringData(
            # Metadata
            date_or_day=date,
            incharge_signature="Zookeeper",
            # Section A: Animal Health
            feed_consumption_percentage="Unknown",
            feed_quantity_consumed="Unknown",
            water_consumption_normal=True,
            digestion_problem=False,
            digestion_problem_details=None,
            injury_or_illness_noticed=False,
            animal_weak_or_lethargic=False,
            health_problem_details=None,
            activity_level="Normal",
            alert_and_responsive=True,
            reproductive_signs_observed=False,
            reproductive_signs_description=None,
            critical_condition_observed=False,
            critical_condition_details=None,
            pests_noticed=False,
            safety_risks_noticed=False,
            safety_risk_details=None,
            additional_observations=observation_text if observation_text else None,
            # Enclosure Report
            enclosure_cleaning_time=None,
            waste_removed_properly=True,
            waste_removal_issue=None,
            water_trough_cleaned=True,
            fresh_water_available=True,
            fencing_secure_and_functioning=True,
            fencing_issue_details=None,
            moat_condition="Not Applicable",
            enclosure_pests_noticed=False,
            staff_attendance_complete=True,
            all_secured_before_closing=True,
            enclosure_remarks=None,
        )


# Instantiate global model
zoo_model = ZooAIModel()
