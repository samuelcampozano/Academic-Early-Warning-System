"""
Script to infer and update student gender based on first names.
Uses a comprehensive Spanish/Ecuadorian name database for accurate gender inference.

Author: Academic Early Warning System
Date: November 2025
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.supabase_client import supabase_client

# Comprehensive Spanish/Latin American name-to-gender mapping
# M = Male, F = Female
GENDER_MAP = {
    # ===== MALE NAMES =====
    # A
    'aaron': 'M', 'abraham': 'M', 'adrian': 'M', 'aitor': 'M', 'alan': 'M', 
    'alayn': 'M', 'alberto': 'M', 'aldo': 'M', 'alejandro': 'M', 'alex': 'M',
    'alexander': 'M', 'andres': 'M', 'andy': 'M', 'anfield': 'M', 'angel': 'M',
    'angelo': 'M', 'anller': 'M', 'anthony': 'M', 'anthuan': 'M', 'argenis': 'M',
    'ariel': 'M', 'axel': 'M',
    # B
    'benjamin': 'M', 'bruce': 'M', 'bruno': 'M', 'byron': 'M',
    # C
    'caleb': 'M', 'carlos': 'M', 'cesar': 'M', 'chris': 'M', 'christopher': 'M',
    'cristhian': 'M', 'cristobal': 'M', 'cristopher': 'M',
    # D
    'damian': 'M', 'danilo': 'M', 'dante': 'M', 'dario': 'M', 'daris': 'M',
    'darwin': 'M', 'dave': 'M', 'david': 'M', 'deiker': 'M', 'deiner': 'M',
    'demian': 'M', 'denis': 'M', 'dereck': 'M', 'derick': 'M', 'deyker': 'M',
    'diego': 'M', 'dilan': 'M', 'diogo': 'M', 'domenic': 'M', 'dominic': 'M',
    'donato': 'M', 'dostin': 'M', 'douglas': 'M', 'dylan': 'M',
    # E
    'eddu': 'M', 'edgar': 'M', 'edison': 'M', 'edops': 'M', 'edu': 'M',
    'elias': 'M', 'elkin': 'M', 'emanuel': 'M', 'emil': 'M', 'emilio': 'M',
    'eren': 'M', 'erick': 'M',
    # F
    'ferdinand': 'M', 'fernando': 'M', 'francis': 'M', 'francisco': 'M', 'freddy': 'M',
    # G
    'gael': 'M', 'geovanny': 'M', 'gerson': 'M', 'gian': 'M', 'gregory': 'M',
    # H
    'hans': 'M', 'haykel': 'M', 'hector': 'M', 'heiner': 'M', 'henry': 'M',
    'holger': 'M', 'huber': 'M',
    # I
    'ian': 'M', 'ihan': 'M', 'iker': 'M', 'isaias': 'M', 'isandro': 'M',
    'ismael': 'M', 'issac': 'M', 'ithan': 'M', 'iuve': 'M', 'ivan': 'M',
    # J
    'jadenth': 'M', 'jahir': 'M', 'james': 'M', 'jan': 'M', 'jander': 'M',
    'jandey': 'M', 'jandry': 'M', 'jarvin': 'M', 'jean': 'M', 'jeffrey': 'M',
    'jeffry': 'M', 'jehycoth': 'M', 'jeiker': 'M', 'jeremy': 'M', 'jerry': 'M',
    'jeshua': 'M', 'jesus': 'M', 'jey': 'M', 'jheykol': 'M', 'jhon': 'M',
    'jhonny': 'M', 'jhosep': 'M', 'jimmy': 'M', 'jipson': 'M', 'joao': 'M',
    'joel': 'M', 'johan': 'M', 'johanner': 'M', 'john': 'M', 'jordan': 'M',
    'jordeny': 'M', 'jordy': 'M', 'jorge': 'M', 'jorwin': 'M', 'jose': 'M',
    'joseph': 'M', 'joser': 'M', 'joshua': 'M', 'jostin': 'M', 'jostyn': 'M',
    'josé': 'M', 'juan': 'M', 'julio': 'M',
    # K
    'kahyler': 'M', 'keinster': 'M', 'kelvin': 'M', 'kenshi': 'M', 'kevin': 'M',
    'keyler': 'M', 'klever': 'M',
    # L
    'leandro': 'M', 'leonardo': 'M', 'liam': 'M', 'lione': 'M', 'lizandro': 'M',
    'lucas': 'M', 'luis': 'M',
    # M
    'maddox': 'M', 'marcos': 'M', 'marlon': 'M', 'mateo': 'M', 'mateus': 'M',
    'matheo': 'M', 'matheus': 'M', 'mathew': 'M', 'mathews': 'M', 'mathias': 'M',
    'mathius': 'M', 'mathyus': 'M', 'matias': 'M', 'matthew': 'M', 'matthews': 'M',
    'matías': 'M', 'mauricio': 'M', 'maxs': 'M', 'maxwell': 'M', 'maykel': 'M',
    'michael': 'M', 'miguel': 'M', 'milan': 'M', 'miller': 'M', 'milton': 'M',
    # N
    'nathanael': 'M', 'nicolaz': 'M',
    # O
    'oliver': 'M', 'oscar': 'M',
    # P
    'pablo': 'M', 'patricio': 'M', 'piero': 'M',
    # R
    'ramon': 'M', 'randy': 'M', 'ricardo': 'M', 'roberth': 'M', 'robinson': 'M',
    'roger': 'M', 'rolando': 'M', 'ronald': 'M', 'ronny': 'M', 'ruben': 'M',
    # S
    'salem': 'M', 'samir': 'M', 'samirth': 'M', 'samuel': 'M', 'samy': 'M',
    'sandro': 'M', 'santiago': 'M', 'saul': 'M', 'steven': 'M',
    # T
    'teddy': 'M', 'thiago': 'M', 'thomas': 'M',
    # V
    'victor': 'M', 'victore': 'M',
    # W
    'wilson': 'M', 'wyatt': 'M',
    # X
    'xavier': 'M',
    # Y
    'yahiro': 'M', 'yandry': 'M',
    # Z
    'zahir': 'M',

    # ===== FEMALE NAMES =====
    # A
    'abigail': 'F', 'adamaris': 'F', 'adriana': 'F', 'ailen': 'F', 'aime': 'F',
    'ainhara': 'F', 'ainhoa': 'F', 'ainoa': 'F', 'aisha': 'F', 'alaia': 'F',
    'alejandra': 'F', 'alena': 'F', 'alexa': 'F', 'alexia': 'F', 'aliss': 'F',
    'alisson': 'F', 'alyssa': 'F', 'ama': 'F', 'amaia': 'F', 'amala': 'F',
    'amalia': 'F', 'ambar': 'F', 'amelia': 'F', 'amy': 'F', 'anahi': 'F',
    'analia': 'F', 'ancelica': 'F', 'andrea': 'F', 'angeline': 'F', 'ania': 'F',
    'anjearle': 'F', 'antonella': 'F', 'arantza': 'F', 'arely': 'F', 'arelys': 'F',
    'ariana': 'F', 'ashley': 'F', 'ashly': 'F',
    # B
    'breisy': 'F', 'briana': 'F', 'brianna': 'F', 'britany': 'F', 'brithanny': 'F',
    'britheny': 'F', 'brittany': 'F',
    # C
    'camila': 'F', 'carla': 'F', 'carolina': 'F', 'cathaleya': 'F', 'clara': 'F',
    'cristhy': 'F',
    # D
    'daenerys': 'F', 'dailyn': 'F', 'dana': 'F', 'daniela': 'F', 'daniella': 'F',
    'danna': 'F', 'dara': 'F', 'dasha': 'F', 'dayana': 'F', 'dayeska': 'F',
    'dayla': 'F', 'daysha': 'F', 'denise': 'F', 'diana': 'F', 'diara': 'F',
    'dilavy': 'F', 'dilma': 'F', 'dolia': 'F', 'domenica': 'F', 'dulce': 'F',
    'duna': 'F',
    # E
    'elizabeth': 'F', 'emilia': 'F', 'emily': 'F', 'emma': 'F', 'evelyn': 'F',
    # F
    'fiorella': 'F', 'fransheska': 'F',
    # G
    'genesis': 'F', 'geovanna': 'F', 'gislayne': 'F', 'gislayner': 'F', 'givanna': 'F',
    # H
    'hally': 'F', 'heidy': 'F', 'hillary': 'F',
    # I
    'idaidy': 'F', 'ingrid': 'F', 'irina': 'F', 'isabella': 'F', 'isis': 'F',
    'ivis': 'F', 'izaslun': 'F',
    # J
    'janelly': 'F', 'jareni': 'F', 'jarilin': 'F', 'jenny': 'F', 'jhoselyn': 'F',
    'jordana': 'F', 'josenca': 'F', 'josselyn': 'F', 'jossephy': 'F', 'judith': 'F',
    'juletey': 'F', 'juleyka': 'F', 'julia': 'F', 'juliana': 'F', 'julieta': 'F',
    'julieth': 'F',
    # K
    'karen': 'F', 'karla': 'F', 'katherin': 'F', 'keily': 'F', 'keiny': 'F',
    'keira': 'F', 'keirz': 'F', 'keisha': 'F', 'keyla': 'F', 'khiara': 'F',
    'kiara': 'F', 'kristie': 'F', 'kyara': 'F',
    # L
    'leiah': 'F', 'leonor': 'F', 'lia': 'F', 'lilibeth': 'F', 'linda': 'F',
    'lity': 'F', 'liz': 'F', 'llybeth': 'F', 'lourdes': 'F', 'luciana': 'F',
    # M
    'mabel': 'F', 'madeleine': 'F', 'madeleyn': 'F', 'mahely': 'F', 'maholy': 'F',
    'maideline': 'F', 'maireny': 'F', 'marcia': 'F', 'maria': 'F', 'martina': 'F',
    'mary': 'F', 'mayerly': 'F', 'maylin': 'F', 'megan': 'F', 'meiby': 'F',
    'meily': 'F', 'melanie': 'F', 'melina': 'F', 'mellany': 'F', 'meritxell': 'F',
    'mia': 'F', 'michelle': 'F', 'milena': 'F', 'milenka': 'F', 'millie': 'F',
    'mya': 'F',
    # N
    'nahomi': 'F', 'nashly': 'F', 'natasha': 'F', 'nathalia': 'F', 'nathaly': 'F',
    'nayara': 'F', 'nayeska': 'F', 'nayleth': 'F', 'naysha': 'F', 'nia': 'F',
    'nicole': 'F', 'niurka': 'F', 'noa': 'F', 'nohelia': 'F', 'norcris': 'F',
    # O
    'odalys': 'F', 'omaly': 'F', 'oriana': 'F',
    # P
    'paula': 'F', 'paulina': 'F', 'pulina': 'F',
    # R
    'rahely': 'F', 'raphaela': 'F', 'rebeca': 'F', 'ricarda': 'F', 'romina': 'F',
    'rosette': 'F', 'ruth': 'F',
    # S
    'samantha': 'F', 'samara': 'F', 'sara': 'F', 'sarah': 'F', 'sarita': 'F',
    'sasha': 'F', 'scarleth': 'F', 'scarlett': 'F', 'shai': 'F', 'shanna': 'F',
    'shayla': 'F', 'shayra': 'F', 'sheily': 'F', 'sheyla': 'F', 'shyra': 'F',
    'sofia': 'F', 'solange': 'F', 'sophia': 'F', 'sophie': 'F', 'stefany': 'F',
    'stephania': 'F', 'sthepany': 'F', 'suri': 'F', 'sury': 'F',
    # T
    'tamar': 'F', 'thaira': 'F', 'tiffany': 'F',
    # V
    'valeria': 'F', 'vianka': 'F', 'victoria': 'F', 'victorial': 'F', 'vielka': 'F',
    'violeta': 'F',
    # Y
    'yarely': 'F', 'yelena': 'F', 'yenedith': 'F', 'yerati': 'F', 'yolanda': 'F',
    'ytzel': 'F', 'yurani': 'F',
    # Z
    'zhoe': 'F', 'zoe': 'F', 'zury': 'F',
}


def infer_gender(full_name: str) -> str:
    """
    Infer gender from a full name by extracting the first name.
    Returns 'M' for male, 'F' for female, or None if unknown.
    """
    if not full_name:
        return None
    
    # Extract first name (first word)
    first_name = full_name.split()[0].lower().strip()
    
    # Look up in our gender map
    return GENDER_MAP.get(first_name, None)


def update_student_genders(dry_run: bool = True):
    """
    Update gender field for all students based on their first names.
    
    Args:
        dry_run: If True, only print what would be updated without making changes.
    """
    print("=" * 60)
    print("STUDENT GENDER UPDATE SCRIPT")
    print("=" * 60)
    
    # Fetch all students
    print("\n📥 Fetching all students from database...")
    result = supabase_client.client.table('students').select('id, nombre, genero').execute()
    students = result.data
    print(f"   Found {len(students)} students")
    
    # Track statistics
    stats = {
        'total': len(students),
        'already_set': 0,
        'inferred_male': 0,
        'inferred_female': 0,
        'unknown': 0,
        'updated': 0,
        'errors': 0
    }
    
    unknown_names = []
    updates = []
    
    print("\n🔍 Analyzing student names...")
    
    for student in students:
        student_id = student['id']
        nombre = student['nombre']
        current_gender = student['genero']
        
        # Skip if gender already set
        if current_gender:
            stats['already_set'] += 1
            continue
        
        # Infer gender from name
        inferred_gender = infer_gender(nombre)
        
        if inferred_gender:
            if inferred_gender == 'M':
                stats['inferred_male'] += 1
            else:
                stats['inferred_female'] += 1
            
            updates.append({
                'id': student_id,
                'nombre': nombre,
                'gender': inferred_gender
            })
        else:
            stats['unknown'] += 1
            first_name = nombre.split()[0] if nombre else 'N/A'
            if first_name.lower() not in [n.lower() for n, _ in unknown_names]:
                unknown_names.append((first_name, nombre))
    
    # Print analysis results
    print("\n" + "=" * 60)
    print("ANALYSIS RESULTS")
    print("=" * 60)
    print(f"📊 Total students:        {stats['total']}")
    print(f"✅ Already have gender:   {stats['already_set']}")
    print(f"👨 Inferred as Male:      {stats['inferred_male']}")
    print(f"👩 Inferred as Female:    {stats['inferred_female']}")
    print(f"❓ Unknown names:         {stats['unknown']}")
    
    if unknown_names:
        print(f"\n⚠️  Unknown first names ({len(unknown_names)}):")
        for first_name, full_name in sorted(unknown_names):
            print(f"   - {first_name} (from: {full_name})")
    
    # Perform updates
    if not dry_run and updates:
        print("\n" + "=" * 60)
        print("UPDATING DATABASE")
        print("=" * 60)
        
        for i, update in enumerate(updates):
            try:
                # Convert M/F to database format: Masculino/Femenino
                gender_db = 'Masculino' if update['gender'] == 'M' else 'Femenino'
                supabase_client.client.table('students').update({
                    'genero': gender_db
                }).eq('id', update['id']).execute()
                
                stats['updated'] += 1
                
                # Progress indicator
                if (i + 1) % 50 == 0:
                    print(f"   Updated {i + 1}/{len(updates)} students...")
                    
            except Exception as e:
                stats['errors'] += 1
                print(f"   ❌ Error updating {update['id']}: {e}")
        
        print(f"\n✅ Successfully updated {stats['updated']} students")
        if stats['errors'] > 0:
            print(f"❌ Errors: {stats['errors']}")
    
    elif dry_run:
        print("\n" + "=" * 60)
        print("DRY RUN - No changes made")
        print("=" * 60)
        print(f"Would update {len(updates)} students")
        print("\nSample updates:")
        for update in updates[:10]:
            gender_label = "Masculino" if update['gender'] == 'M' else "Femenino"
            print(f"   {update['id']}: {update['nombre']} → {gender_label}")
        if len(updates) > 10:
            print(f"   ... and {len(updates) - 10} more")
        
        print("\n💡 Run with --execute to apply changes")
    
    return stats


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Update student gender based on first names')
    parser.add_argument('--execute', action='store_true', 
                       help='Actually update the database (default is dry run)')
    
    args = parser.parse_args()
    
    if args.execute:
        print("\n⚠️  EXECUTING DATABASE UPDATE ⚠️\n")
        response = input("Are you sure you want to update the database? (yes/no): ")
        if response.lower() == 'yes':
            update_student_genders(dry_run=False)
        else:
            print("Aborted.")
    else:
        update_student_genders(dry_run=True)
