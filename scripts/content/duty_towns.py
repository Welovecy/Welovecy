# Greek town names in the rota -> English names as used across the site (matches the register's town field)
TOWNS = {
 'Αυγόρου':'Avgorou','Δερύνεια':'Deryneia','Λιοπέτρι':'Liopetri','Παραλίμνι':'Paralimni','Σωτήρα':'Sotira','Φρέναρος':'Frenaros',
 'Αραδίππου':'Aradippou','Δρομολαξιά':'Dromolaxia','Κίτι':'Kiti','Λάρνακα':'Larnaca','Λειβάδια':'Livadia','Μενεού':'Meneou','Ορόκλινη':'Oroklini',
 'Άγιος Αθανάσιος':'Agios Athanasios','Άγιος Νικόλαος':'Agios Nikolaos','Άγιος Τύχωνας':'Agios Tychonas','Ύψωνας':'Ypsonas','Γερμασόγεια':'Germasogeia',
 'Επισκοπή':'Episkopi','Ερήμη':'Erimi','Κάτω Πολεμίδια':'Kato Polemidia','Κολόσσι':'Kolossi','Λεμεσός':'Limassol','Μέσα Γειτονιά':'Mesa Geitonia',
 'Μουτταγιάκα':'Moutagiaka','Πάνω Πολεμίδια':'Pano Polemidia','Πολεμίδια':'Polemidia',
 'Άγιος Ανδρέας':'Agios Andreas','Άγιος Δομέτιος':'Agios Dometios','Έγκωμη':'Egkomi','Αγίοι Ομολογητές':'Agioi Omologites','Αγλαντζιά':'Aglantzia',
 'Ανθούπολη':'Anthoupoli','Γέρι':'Geri','Δάλι':'Dali','Καϊμακλί':'Kaimakli','Λακατάμεια':'Lakatamia','Λατσιά':'Latsia','Λευκωσία':'Nicosia',
 'Λύμπια':'Lympia','Πάνω Λακατάμεια':'Pano Lakatamia','Πέρα Χωριό Νήσου':'Pera Chorio Nisou','Παλλουριώτισσα':'Pallouriotissa','Στρόβολος':'Strovolos',
 'Τσέρι':'Tseri','Αναβαργός':'Anavargos','Γεροσκήπου':'Geroskipou','Κάτω Πάφος':'Kato Paphos','Κονιά':'Konia','Πάφος':'Paphos','Προδρόμι':'Prodromi',
 'Πόλις Χρυσοχούς':'Polis Chrysochous','Χλώρακας':'Chloraka',
}

# Town centres where our own data has too few points; approximate, used only for "about N km" when a pharmacy has no exact pin.
FIXED = {
 'Agios Nikolaos': [34.692, 33.033], 'Polemidia': [34.692, 33.004], 'Agios Andreas': [35.167, 33.370],
 'Anthoupoli': [35.120, 33.320], 'Pano Lakatamia': [35.100, 33.300], 'Prodromi': [35.030, 32.400],
}
