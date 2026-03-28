-- Medical Tests Catalog — 50 Common Tests
-- =============================================

TRUNCATE TABLE medical_tests CASCADE;

-- Blood Tests
INSERT INTO medical_tests (test_name, category, typical_min_price, typical_max_price, description, keywords)
VALUES
  ('Complete Blood Count (CBC)', 'Blood Test', 200, 500, 'Measures red blood cells, white blood cells, hemoglobin, hematocrit, and platelets to detect infections, anemia, and other disorders.', 'fatigue,anemia,infection,weakness,fever,bleeding,bruising,wbc,rbc,hemoglobin'),
  ('Erythrocyte Sedimentation Rate (ESR)', 'Blood Test', 100, 300, 'Measures inflammation in the body by checking how quickly red blood cells settle.', 'inflammation,joint pain,arthritis,fever,autoimmune'),
  ('Peripheral Blood Smear', 'Blood Test', 150, 400, 'Examines blood cells under a microscope to detect abnormalities in shape, size, and number.', 'anemia,infection,malaria,platelet,blood disorder'),
  ('Prothrombin Time (PT/INR)', 'Blood Test', 200, 500, 'Measures how long it takes blood to clot. Used to monitor blood-thinning medication.', 'bleeding,clotting,bruising,warfarin,blood thinner'),
  ('Blood Group & Rh Typing', 'Blood Test', 100, 250, 'Determines ABO blood group and Rh factor for transfusions and pregnancy care.', 'blood group,transfusion,pregnancy,surgery')
ON CONFLICT DO NOTHING;

-- Diabetes & Sugar
INSERT INTO medical_tests (test_name, category, typical_min_price, typical_max_price, description, keywords)
VALUES
  ('Fasting Blood Sugar (FBS)', 'Diabetes', 80, 200, 'Measures blood glucose after 8-12 hours of fasting to screen for diabetes.', 'thirst,frequent urination,diabetes,sugar,fatigue,hunger'),
  ('HbA1c (Glycated Hemoglobin)', 'Diabetes', 400, 900, 'Shows average blood sugar control over the past 2-3 months.', 'diabetes,sugar control,thirst,fatigue,weight loss,glucose'),
  ('Post Prandial Blood Sugar (PPBS)', 'Diabetes', 80, 200, 'Measures blood glucose 2 hours after eating to assess insulin response.', 'diabetes,sugar,after meal,glucose,insulin'),
  ('Oral Glucose Tolerance Test (OGTT)', 'Diabetes', 250, 600, 'Diagnoses gestational diabetes and pre-diabetes by measuring glucose response over time.', 'pregnancy,gestational diabetes,pre-diabetes,glucose tolerance'),
  ('Fructosamine', 'Diabetes', 300, 700, 'Measures average blood sugar over past 2-3 weeks, useful when HbA1c is unreliable.', 'diabetes,short term sugar,anemia,hemoglobin variant')
ON CONFLICT DO NOTHING;

-- Thyroid & Hormones
INSERT INTO medical_tests (test_name, category, typical_min_price, typical_max_price, description, keywords)
VALUES
  ('Thyroid Profile (T3, T4, TSH)', 'Hormone', 300, 800, 'Measures thyroid hormone levels to detect hypothyroidism or hyperthyroidism.', 'fatigue,weight gain,weight loss,hair fall,cold,thyroid,metabolism,neck swelling'),
  ('TSH (Thyroid Stimulating Hormone)', 'Hormone', 150, 400, 'Primary screening test for thyroid function disorders.', 'thyroid,fatigue,weight,hair loss,cold sensitivity'),
  ('Free T4 (Thyroxine)', 'Hormone', 200, 500, 'Measures unbound T4 hormone to evaluate thyroid function.', 'thyroid,metabolism,fatigue,tremors'),
  ('Testosterone', 'Hormone', 400, 1000, 'Measures testosterone levels for reproductive and hormonal health assessment.', 'low energy,muscle loss,libido,erectile,infertility,hormone'),
  ('Cortisol', 'Hormone', 300, 800, 'Measures stress hormone levels to detect adrenal disorders.', 'stress,fatigue,weight gain,insomnia,cushing,adrenal'),
  ('Prolactin', 'Hormone', 300, 700, 'Measures prolactin hormone for fertility and pituitary evaluation.', 'irregular periods,infertility,breast discharge,headache,pituitary'),
  ('Estradiol (E2)', 'Hormone', 350, 900, 'Measures estrogen levels for menstrual, fertility, and menopause evaluation.', 'irregular periods,menopause,hot flashes,infertility,PCOS')
ON CONFLICT DO NOTHING;

-- Liver Function
INSERT INTO medical_tests (test_name, category, typical_min_price, typical_max_price, description, keywords)
VALUES
  ('Liver Function Test (LFT)', 'Liver', 300, 800, 'Panel measuring bilirubin, ALT, AST, ALP, albumin, and total protein to assess liver health.', 'jaundice,abdominal pain,nausea,vomiting,alcohol,liver,hepatitis,yellowish skin'),
  ('Hepatitis B Surface Antigen (HBsAg)', 'Liver', 200, 500, 'Screens for active Hepatitis B infection.', 'hepatitis,liver,jaundice,fatigue,vomiting,vaccination'),
  ('Hepatitis C Antibody', 'Liver', 300, 800, 'Screens for Hepatitis C virus infection.', 'hepatitis,liver,blood transfusion,needle,jaundice,vomiting'),
  ('Gamma GT (GGT)', 'Liver', 200, 500, 'Measures GGT enzyme to detect liver disease and bile duct problems.', 'alcohol,liver,bile duct,jaundice,vomiting,medication')
ON CONFLICT DO NOTHING;

-- Kidney Function
INSERT INTO medical_tests (test_name, category, typical_min_price, typical_max_price, description, keywords)
VALUES
  ('Kidney Function Test (KFT/RFT)', 'Kidney', 300, 800, 'Measures creatinine, BUN, uric acid, and electrolytes to assess kidney health.', 'swelling,urination,back pain,nausea,vomiting,dehydration,kidney,dialysis,creatinine'),
  ('Serum Creatinine', 'Kidney', 100, 300, 'Key marker for kidney function and filtration rate.', 'kidney,renal,swelling,urination,dehydration,nausea'),
  ('Blood Urea Nitrogen (BUN)', 'Kidney', 100, 300, 'Measures urea nitrogen to evaluate kidney and liver function.', 'kidney,dehydration,fatigue,protein,nausea'),
  ('Urine Routine & Microscopy', 'Kidney', 80, 200, 'Analyzes urine for infections, kidney disease, and metabolic disorders.', 'burning urination,UTI,kidney stone,protein in urine,blood in urine,vomiting'),
  ('Microalbumin (Urine)', 'Kidney', 300, 700, 'Detects early kidney damage, especially in diabetic patients.', 'diabetes,kidney,albumin,early detection')
ON CONFLICT DO NOTHING;

-- Heart & Cholesterol
INSERT INTO medical_tests (test_name, category, typical_min_price, typical_max_price, description, keywords)
VALUES
  ('Lipid Profile', 'Cholesterol', 500, 1200, 'Measures total cholesterol, LDL, HDL, triglycerides, and VLDL for cardiovascular risk assessment.', 'cholesterol,heart,chest pain,obesity,high fat,triglycerides'),
  ('Troponin I / Troponin T', 'Heart', 500, 1500, 'Detects heart muscle damage — primary test for diagnosing heart attacks.', 'chest pain,heart attack,breathlessness,arm pain,cardiac'),
  ('BNP / NT-proBNP', 'Heart', 800, 2000, 'Measures brain natriuretic peptide to diagnose heart failure.', 'breathlessness,swelling,heart failure,chest tightness'),
  ('CRP (C-Reactive Protein)', 'Heart', 200, 500, 'Measures inflammation marker linked to cardiovascular disease risk.', 'inflammation,heart,infection,arthritis,chest pain'),
  ('Homocysteine', 'Heart', 500, 1200, 'Elevated levels indicate cardiovascular disease and vitamin B12/folate deficiency risk.', 'heart,stroke,B12,folate,numbness,tingling')
ON CONFLICT DO NOTHING;

-- Vitamins & Minerals
INSERT INTO medical_tests (test_name, category, typical_min_price, typical_max_price, description, keywords)
VALUES
  ('Vitamin D (25-OH)', 'Vitamin', 400, 1000, 'Measures Vitamin D levels important for bone health and immunity.', 'bone pain,fatigue,muscle weakness,depression,rickets,calcium'),
  ('Vitamin B12', 'Vitamin', 400, 900, 'Measures B12 levels essential for nerve function and red blood cell production.', 'numbness,tingling,fatigue,weakness,vegetarian,anemia,memory'),
  ('Iron Studies (Serum Iron, TIBC, Ferritin)', 'Vitamin', 400, 1000, 'Comprehensive iron assessment for anemia diagnosis and iron overload.', 'fatigue,weakness,pale skin,hair loss,anemia,iron deficiency'),
  ('Calcium', 'Vitamin', 100, 300, 'Measures calcium levels for bone, muscle, and nerve function.', 'bone pain,muscle cramps,tingling,osteoporosis,fracture'),
  ('Magnesium', 'Vitamin', 150, 400, 'Measures magnesium important for muscle, nerve, and heart function.', 'muscle cramps,fatigue,insomnia,anxiety,heart rhythm')
ON CONFLICT DO NOTHING;

-- Infection & Immunity
INSERT INTO medical_tests (test_name, category, typical_min_price, typical_max_price, description, keywords)
VALUES
  ('Widal Test', 'Infection', 100, 300, 'Detects antibodies against Salmonella for typhoid fever diagnosis.', 'fever,typhoid,abdominal pain,headache,diarrhea'),
  ('Dengue NS1 Antigen + IgM/IgG', 'Infection', 400, 1000, 'Diagnoses dengue fever at different stages of infection.', 'fever,dengue,body pain,rash,platelet drop,mosquito'),
  ('Malaria Antigen (Rapid)', 'Infection', 200, 500, 'Rapid detection of malaria parasite antigens in blood.', 'fever,chills,sweating,malaria,mosquito,headache'),
  ('HIV 1 & 2 Antibody', 'Infection', 200, 600, 'Screens for HIV infection with high sensitivity.', 'HIV,immunity,weight loss,fever,night sweats'),
  ('VDRL / RPR (Syphilis)', 'Infection', 100, 300, 'Screens for syphilis infection.', 'syphilis,STD,rash,sore,ulcer'),
  ('COVID-19 RT-PCR', 'Infection', 300, 800, 'Gold standard molecular test for active COVID-19 infection.', 'cough,fever,breathlessness,covid,corona,loss of smell,taste')
ON CONFLICT DO NOTHING;

-- Imaging & Special Tests
INSERT INTO medical_tests (test_name, category, typical_min_price, typical_max_price, description, keywords)
VALUES
  ('X-Ray (Chest)', 'Imaging', 200, 500, 'Chest radiograph to evaluate lungs, heart, and chest wall.', 'cough,breathlessness,chest pain,tuberculosis,pneumonia'),
  ('Ultrasound Abdomen', 'Imaging', 500, 1500, 'Non-invasive imaging of liver, kidneys, gallbladder, pancreas, and other abdominal organs.', 'abdominal pain,swelling,stones,liver,kidney,gallbladder'),
  ('ECG (Electrocardiogram)', 'Imaging', 150, 400, 'Records electrical activity of the heart to detect rhythm disorders and heart disease.', 'chest pain,palpitations,breathlessness,heart,dizziness,fainting'),
  ('MRI Brain', 'Imaging', 3000, 8000, 'Detailed imaging of brain structures for stroke, tumors, and neurological disorders.', 'headache,seizure,vision change,stroke,brain tumor,dizziness'),
  ('CT Scan Chest', 'Imaging', 2000, 6000, 'Cross-sectional chest imaging for lung nodules, infections, and trauma.', 'chest pain,cough,breathlessness,lung,nodule,trauma')
ON CONFLICT DO NOTHING;

-- Allergy & Autoimmune
INSERT INTO medical_tests (test_name, category, typical_min_price, typical_max_price, description, keywords)
VALUES
  ('IgE Total (Allergy Screen)', 'Allergy', 300, 800, 'Measures total IgE antibodies to evaluate allergic conditions.', 'allergy,rash,itching,sneezing,asthma,hives,eczema'),
  ('ANA (Antinuclear Antibody)', 'Autoimmune', 500, 1200, 'Screens for autoimmune diseases like lupus, rheumatoid arthritis, and Sjogrens syndrome.', 'joint pain,rash,fatigue,autoimmune,lupus,dry eyes,butterfly rash'),
  ('Rheumatoid Factor (RF)', 'Autoimmune', 200, 600, 'Detects rheumatoid factor antibodies for joint disease diagnosis.', 'joint pain,stiffness,swelling,rheumatoid,arthritis,morning stiffness'),
  ('Anti-CCP Antibody', 'Autoimmune', 600, 1500, 'Highly specific marker for rheumatoid arthritis diagnosis.', 'joint pain,rheumatoid,arthritis,stiffness,swelling'),
  ('Serum Electrolytes (Na, K, Cl)', 'Blood Test', 250, 600, 'Measures sodium, potassium, and chloride levels to check for dehydration and pH balance.', 'vomiting,diarrhea,dehydration,weakness,confusion,dizziness'),
  ('HCG (Pregnancy Test)', 'Hormone', 150, 400, 'Measures HCG hormone to confirm pregnancy.', 'missed period,morning sickness,nausea,vomiting,pregnancy')
ON CONFLICT DO NOTHING;
insert into medical_tests (test_name, category, typical_min_price, typical_max_price, description, keywords)
values
  ('MRI Spine (Cervical/Lumbar)', 'Imaging', 5000, 12000, 'Detailed imaging of the spine to detect disc herniation, stenosis, and nerve compression.', 'back pain,spine,neck pain,slipped disc,sciatica,numbness,weakness,vertebrae'),
  ('X-Ray Spine', 'Imaging', 500, 1500, 'Radiograph of the spine to evaluate alignment, fractures, and degenerative changes.', 'back pain,spine,posture,injury,vertebrae,fracture'),
  ('Bone Density (DEXA) Scan', 'Imaging', 1500, 3500, 'Measures bone mineral density to screen for osteoporosis and fracture risk.', 'bone pain,fracture,menopause,osteoporosis,spine'),
  ('Vitamin B12 & D Panel', 'Vitamin', 800, 1800, 'Combined screening for bone health and nerve function.', 'back pain,numbness,bone health,nerve pain,spine')
ON CONFLICT DO NOTHING;

-- End of data.sql

