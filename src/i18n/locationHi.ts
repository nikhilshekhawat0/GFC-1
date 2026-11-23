import type { Lang } from './translations';
import type { McgHotspot } from '../data/mcgHotspots';

const EXACT_LOCATION_HI: Record<string, string> = {
  // Ward 1
  'Near Budwala Booster': 'बुड़वाला बूस्टर के पास',
  'Nathupur near Harijan Basti': 'नाथूपुर, हरिजन बस्ती के पास',
  'Sikanderpur entry from Bristol Chowk': 'सिकंदरपुर प्रवेश (ब्रिस्टल चौक की ओर से)',

  // Ward 2
  'Sunar Wali Gali Dundahera': 'सुनार वाली गली, डूंडाहेड़ा',
  'Bank Wali Gali Dundahera': 'बैंक वाली गली, डूंडाहेड़ा',
  'Sarhol Mod Sector-18 T-Point': 'सरहोल मोड़, सेक्टर-18 टी-पॉइंट',
  'Indian Oil Service Road Sector 18': 'इंडियन ऑयल सर्विस रोड, सेक्टर 18',
  'Near LIC Office Sector-18': 'एलआईसी कार्यालय के पास, सेक्टर-18',
  'In front of Plot No-75D Sector 18': 'प्लॉट नं. 75D के सामने, सेक्टर 18',
  'Plot No-75D Sector 18': 'प्लॉट नं. 75D, सेक्टर 18',

  // Ward 3
  'In front of H.No-1128 Sector 21': 'मकान नं. 1128 के सामने, सेक्टर 21',
  'H.No-1128 Sector 21': 'मकान नं. 1128, सेक्टर 21',
  'Near Radha Krishna Mandir H.No-335 Sec 21': 'राधा कृष्ण मंदिर के पास, मकान नं. 335, सेक्टर 21',
  'Radha Krishna Mandir H.No-335 Sec 21': 'राधा कृष्ण मंदिर, मकान नं. 335, सेक्टर 21',
  'Near Delhi Gate Pocket C Sector 21': 'दिल्ली गेट पॉकेट-C के पास, सेक्टर 21',
  'Delhi Gate Pocket C Sector 21': 'दिल्ली गेट पॉकेट-C, सेक्टर 21',
  'In front of Community Centre Sector 22B': 'कम्युनिटी सेंटर के सामने, सेक्टर 22B',
  'Community Centre Sector 22B': 'कम्युनिटी सेंटर, सेक्टर 22B',

  // Ward 4
  'A Block Palam Vihar near Macdy': 'ए-ब्लॉक पालम विहार (मैकडी के पास)',
  "A Block Palam Vihar near McDonald's": 'ए-ब्लॉक पालम विहार, मैकडॉनल्ड्स के पास',
  'Palam Vihar C-2 Block': 'पालम विहार सी-2 ब्लॉक',
  'Palam Vihar D Block near Mother Dairy': 'पालम विहार डी-ब्लॉक (मदर डेयरी के पास)',
  'Palam Vihar D Block Mother Dairy': 'पालम विहार डी-ब्लॉक मदर डेयरी',
  'Sec 23 near Ansal Plaza': 'सेक्टर 23, अंसल प्लाजा के पास',

  // Ward 5 & 6
  'Bajghera Firni': 'बजघेड़ा फिरनी',
  'Bajghera Firni Road': 'बजघेड़ा फिरनी रोड',
  'Dhankot Canal Road': 'धनकोट नहर रोड',

  // Ward 7
  'Basai Village near Lakhpat Kataria House': 'बसई गाँव, लखपत कटारिया आवास के पास',
  'Basai Village Lakhpat Kataria House': 'बसई गाँव, लखपत कटारिया आवास',
  'Basai Village near Community Center': 'बसई गाँव, कम्युनिटी सेंटर के पास',
  'Basai Village Community Center': 'बसई गाँव कम्युनिटी सेंटर',
  'Dhanwapur Village near Bikaner Chowk': 'धनवापुर गाँव, बीकानेर चौक के पास',
  'Dhanwapur Village Bikaner Chowk': 'धनवापुर गाँव, बीकानेर चौक',

  // Ward 8
  'In front of Khushbu Apartment': 'खुशबू अपार्टमेंट के सामने',
  'Khushbu Apartment Sec-9A': 'खुशबू अपार्टमेंट, सेक्टर-9A',
  'Sector-9A Community Centre Road': 'सेक्टर-9A कम्युनिटी सेंटर रोड',
  'Sector-9A Community Centre': 'सेक्टर-9A कम्युनिटी सेंटर',
  'Market Road Sector-9A': 'मार्केट रोड, सेक्टर-9A',
  'Corner of Sidheshwar School': 'सिद्धेश्वर स्कूल का कोना',
  'Sidheshwar School Sector-9A': 'सिद्धेश्वर स्कूल, सेक्टर-9A',

  // Ward 9
  'Side Road of GMDA Bus Stand Sec-10': 'जीएमडीए बस स्टैंड साइड रोड, सेक्टर-10',
  'GMDA Bus Stand Sector-10 (Basai Rd Entry)': 'जीएमडीए बस स्टैंड सेक्टर-10 (बसई रोड प्रवेश)',
  'In front of Alpine School Sec-10': 'अल्पाइन स्कूल के सामने, सेक्टर-10',
  'Alpine School Sector-10': 'अल्पाइन स्कूल, सेक्टर-10',
  'HUDA Market Sec-10 (Blue Bells / Euro Intl)': 'हुडा मार्केट, सेक्टर-10 (ब्लू बेल्स / यूरो इंटरनेशनल)',
  'HUDA Market Sector-10': 'हुडा मार्केट, सेक्टर-10',

  // Ward 10
  'Sector 10A Market near Gate No-7': 'सेक्टर 10A मार्केट, गेट नं. 7 के पास',
  'Near DAV School Sector 10A': 'डीएवी स्कूल के पास, सेक्टर 10A',
  'Sector 10A Gate No-5': 'सेक्टर 10A, गेट नं. 5',
  'Gate No. 05 Sector 10A': 'गेट नं. 05, सेक्टर 10A',
  'Sector 10A in front of Gandhi Nagar Booster': 'सेक्टर 10A, गांधी नगर बूस्टर के सामने',
  'Gandhi Nagar Boosting Station': 'गांधी नगर बूस्टिंग स्टेशन',

  // Ward 11
  'Hans Enclave': 'हंस एन्क्लेव',
  'Near Jain Mandir Hans Enclave': 'जैन मंदिर के पास, हंस एन्क्लेव',
  'Govt Primary School Naharpur Rupa': 'सरकारी प्राथमिक विद्यालय, नाहरपुर रूपा',
  'Near Shiv Mandir Naharpur Rupa': 'शिव मंदिर के पास, नाहरपुर रूपा',
  'Naharpur Rupa Main Entry': 'नाहरपुर रूपा मुख्य प्रवेश',
  'Near Krishan Dharam Kanta': 'किशन धर्म कांटा के पास',
  'Sector 47 Near DPS': 'सेक्टर 47, डीपीएस के पास',
  'Near Community Centre Sector 47': 'कम्युनिटी सेंटर के पास, सेक्टर 47',

  // Ward 12
  'Back side Govt. School Islampur': 'सरकारी स्कूल के पीछे, इस्लामपुर',
  'Near H. No. 559 Sec-39 Bakhtawar Chowk': 'मकान नं. 559 के पास, सेक्टर-39 बख्तावर चौक',
  'H.No. 559 Sec-39 Bakhtawar Chowk': 'मकान नं. 559, सेक्टर-39 बख्तावर चौक',
  'Sec 39 Pocket D near Main Gate': 'सेक्टर 39 पॉकेट-D मुख्य गेट के पास',
  'Sec 39 Pocket D Main Gate': 'सेक्टर 39 पॉकेट-D मुख्य गेट',
  'Sec 39 E Pocket back side Cyber Park': 'सेक्टर 39 ई-पॉकेट (साइबर पार्क के पीछे)',
  'Sec 39 E Pocket Cyber Park': 'सेक्टर 39 ई-पॉकेट, साइबर पार्क',
  'South City near H. No. 42 and 77': 'साउथ सिटी, मकान नं. 42 व 77 के पास',
  'South City H.No. 42 & 77': 'साउथ सिटी, मकान नं. 42 व 77',

  // Ward 13
  'Sector 15 Part II along Citizen Park': 'सेक्टर 15 पार्ट-II (सिटीजन पार्क के साथ)',
  'Sector 15 Part II Citizen Park': 'सेक्टर 15 पार्ट-II सिटीजन पार्क',
  'Bandh Road near H.No 1094 Sec 15 Part-II': 'बांध रोड, मकान नं. 1094 के पास, सेक्टर 15 पार्ट-II',
  'Bandh Road H.No 1094 Sec 15 Part-II': 'बांध रोड, मकान नं. 1094, सेक्टर 15 पार्ट-II',
  'Jubilee Park Sector 31': 'जुबली पार्क, सेक्टर 31',
  'Sector 15 Part II Market Rd towards Skoda': 'सेक्टर 15 पार्ट-II मार्केट रोड (स्कोडा की ओर)',
  'Sector 15 Part II Market Road': 'सेक्टर 15 पार्ट-II मार्केट रोड',
  'Sector 40 House No 1114': 'सेक्टर 40, मकान नं. 1114',
  'Sector 40 H.No 1114': 'सेक्टर 40, मकान नं. 1114',
  'Near House of Smt. Kamla Retd. IAS': 'श्रीमती कमला (सेवानिवृत्त IAS) के घर के पास',
  'House of Smt. Kamla Retd. IAS': 'श्रीमती कमला (सेवानिवृत्त IAS) आवास',

  // Ward 14
  'Sushant Lok Phase 3 (A, D & B1 Block)': 'सुशांत लोक फेज-3 (ए, डी एवं बी1 ब्लॉक)',
  'A, D & B1 Block Sushant Lok 3': 'ए, डी एवं बी1 ब्लॉक, सुशांत लोक 3',
  'Sector 46 near Amethi School H.No 3204': 'सेक्टर 46, अमेठी स्कूल के पास, मकान नं. 3204',
  'Near Amethi School H.No. 3204': 'अमेठी स्कूल के पास, मकान नं. 3204',
  'Sector 57 near Tigra Village': 'सेक्टर 57, तिगरा गाँव के पास',
  'Near Tigra Village Sec 57': 'तिगरा गाँव के पास, सेक्टर 57',
  'Sector 51 near H.No. 930': 'सेक्टर 51, मकान नं. 930 के पास',
  'Near H.No. 930 Sector 51': 'मकान नं. 930 के पास, सेक्टर 51',

  // Ward 15
  'South City II A Block': 'साउथ सिटी-II, ए-ब्लॉक',
  'South City A Block': 'साउथ सिटी ए-ब्लॉक',
  'South City II A1 Block': 'साउथ सिटी-II, ए1-ब्लॉक',
  'South City A1 Block': 'साउथ सिटी ए1-ब्लॉक',
  'South City II C Block': 'साउथ सिटी-II, सी-ब्लॉक',
  'South City C Block': 'साउथ सिटी सी-ब्लॉक',
  'Rosewood City C Block': 'रोज़वुड सिटी, सी-ब्लॉक',
  'Rosewood City D Block': 'रोज़वुड सिटी, डी-ब्लॉक',
  'M R Land Sec 65': 'एम.आर. लैंड, सेक्टर 65',
  'Dhumaspur Village near Jail Road': 'धूमसपुर गाँव, जेल रोड के पास',
  'Near By Jail Road Dhumaspur': 'जेल रोड के पास, धूमसपुर',
  'Dhumaspur Village near Water Supply': 'धूमसपुर गाँव, वाटर सप्लाई के पास',
  'Near Water Supply Dhumaspur': 'वाटर सप्लाई के पास, धूमसपुर',
  'Maidawas Village Shani Mandir': 'मैदावास गाँव, शनि मंदिर',
  'Sachin Tyagi Office to Shani Mandir': 'सचिन त्यागी कार्यालय से शनि मंदिर',
  'Umarpur Nangli Nial School': 'उमरपुर नांगली नियाल स्कूल',
  'Near Bhumiya Mandir Nangli Umarpur': 'भूमिया मंदिर के पास, नांगली उमरपुर',

  // Ward 16
  'Uppal Southend S & W Block': 'उप्पल साउथएंड, एस एवं डब्ल्यू ब्लॉक',
  'Block S, W Uppal Southend': 'ब्लॉक एस, डब्ल्यू, उप्पल साउथएंड',
  'Housing Board Uppal Southend': 'हाउसिंग बोर्ड, उप्पल साउथएंड',
  'Vipul World B, C, D Block': 'विपुल वर्ल्ड, बी, सी, डी ब्लॉक',
  'Vipul World B.C.D Block': 'विपुल वर्ल्ड बी, सी, डी ब्लॉक',
  'Fazilpur Hanuman Mandir': 'फाजिलपुर हनुमान मंदिर',
  'Hanuman Mandir Fazilpur': 'हनुमान मंदिर, फाजिलपुर',

  // Ward 17
  'Begampur Khatola Govt School': 'बेगमपुर खटोला सरकारी स्कूल',
  'Govt School & Hanuman Mandir': 'सरकारी स्कूल एवं हनुमान मंदिर',
  'Behrampur Tata Motors & Axis ATM': 'बहरामपुर, टाटा मोटर्स एवं एक्सिस एटीएम',
  'Tata Motors / Axis Bank ATM Behrampur Rd': 'टाटा मोटर्स / एक्सिस बैंक एटीएम, बहरामपुर रोड',
  'Behrampur Dharmi Ka Theka': 'बहरामपुर, धर्मी का ठेका',
  'Dharmi Ka Theka Behrampur Road': 'धर्मी का ठेका, बहरामपुर रोड',

  // Ward 18
  'Vatika Chowk behind Shamshan Ghat': 'वाटिका चौक, श्मशान घाट के पीछे',
  'Behind Shamshan Ghat Vatika Chowk': 'श्मशान घाट के पीछे, वाटिका चौक',
  'Khota Colony Behind Gandhi Colony': 'खोटा कॉलोनी (गांधी कॉलोनी के पीछे)',
  'Gandhi Colony Badshahpur': 'गांधी कॉलोनी, बादशाहपुर',
  'Tyagiwada near Community Centre': 'त्यागीवाड़ा, कम्युनिटी सेंटर के पास',
  'Tyagiwada Community Centre': 'त्यागीवाड़ा कम्युनिटी सेंटर',
  'RR Colony Behind Girl School': 'आरआर कॉलोनी (गर्ल्स स्कूल के पीछे)',
  'RR Colony Badshahpur': 'आरआर कॉलोनी, बादशाहपुर',

  // Ward 19
  'Maruti Kunj Main Gate': 'मारुति कुंज मुख्य गेट',
  'Saneh Vihar Front of Dadi Sati Mandir': 'सनेह विहार, दादी सती मंदिर के सामने',
  'Dadi Sati Mandir Saneh Vihar': 'दादी सती मंदिर, सनेह विहार',
  'Village Bhondsi near Govt School': 'गाँव भोंडसी, सरकारी स्कूल के पास',
  'Govt School Bhondsi': 'सरकारी स्कूल, भोंडसी',

  // Ward 20
  'Near Khaliya Wala Kuan Village Bandhwari': 'खालिया वाला कुआँ के पास, गाँव बंधवाड़ी',
  'Khaliya Wala Kuan Bandhwari': 'खालिया वाला कुआँ, बंधवाड़ी',
  'Village Ghata Under Pass': 'गाँव घाटा अंडरपास',
  'Teri Gram Faridabad Rd (Baliyawas)': 'टेरी ग्राम, फरीदाबाद रोड (बलियावास)',
  'Village Baliyawas Faridabad Rd': 'गाँव बलियावास, फरीदाबाद रोड',
  'Mujjafar Ali Farm House New Gwal Pahari': 'मुजफ्फर अली फार्म हाउस, न्यू ग्वाल पहाड़ी',
  'New Gwal Pahari Faridabad Rd': 'न्यू ग्वाल पहाड़ी, फरीदाबाद रोड',
  'E Block (Near Creek) Sec-55/56 Road': 'ई-ब्लॉक (नाले के पास), सेक्टर-55/56 रोड',
  'E Block Near Creek Sec-55/56': 'ई-ब्लॉक नाले के पास, सेक्टर-55/56',
  'CRPF Camp Road Kadarpur': 'सीआरपीएफ कैंप रोड, कादरपुर',
  'Main CRPF Camp Road': 'मुख्य सीआरपीएफ कैंप रोड',
  'Kadarpur Mod in front of Baraat Ghar': 'कादरपुर मोड़, बारात घर के सामने',
  'Front of Baraat Ghar Kadarpur': 'बारात घर के सामने, कादरपुर',
  'Hoshiyar Singh Advocate House Behrampur': 'होशियार सिंह एडवोकेट आवास, बहरामपुर',
  'Behrampur Village': 'बहरामपुर गाँव',
  'Main Road Ullawas': 'मुख्य रोड, उल्लावास',

  // Ward 21
  'Ardee City Gate No. 3': 'आरडी सिटी, गेट नं. 3',
  'H.No. 1241 to Tempo Stand Wazirabad': 'मकान नं. 1241 से टेम्पो स्टैंड, वज़ीराबाद',
  'Tempo Stand Wazirabad': 'टेम्पो स्टैंड, वज़ीराबाद',
  'Wazirabad Dhani Chowk': 'वज़ीराबाद ढाणी चौक',
  'Front of Community Center Wazirabad': 'कम्युनिटी सेंटर के सामने, वज़ीराबाद',
  'Jheel Chowk Wazirabad': 'झील चौक, वज़ीराबाद',
  'Sec-57 Main Entry': 'सेक्टर-57 मुख्य प्रवेश',
  'Suncity Main Entrance & B-Block': 'सनसिटी मुख्य प्रवेश एवं बी-ब्लॉक',
  'Near Sec-54 Metro Station': 'सेक्टर-54 मेट्रो स्टेशन के पास',
  'Sector 57 Part 1': 'सेक्टर 57 पार्ट-1',
  'Lane of H.No. 956 Sector 57': 'मकान नं. 956 वाली गली, सेक्टर 57',
  'F & G Block Sushant Lok 2': 'एफ एवं जी ब्लॉक, सुशांत लोक 2',
  'Entrance of Bikanerwala SL-2': 'बीकानेरवाला प्रवेश, सुशांत लोक-2',

  // Ward 22
  'Near Camera Museum Village Chakkarpur': 'कैमरा म्यूजियम के पास, गाँव चक्करपुर',
  'Camera Museum Chakkarpur': 'कैमरा म्यूजियम, चक्करपुर',
  'A-1065 Lane A-Block Sushant Lok-1': 'ए-1065 गली, ए-ब्लॉक, सुशांत लोक-1',
  'H.No-1065 Sushant Lok-1': 'मकान नं. 1065, सुशांत लोक-1',
  'A-206 Lane A-Block Sushant Lok-1': 'ए-206 गली, ए-ब्लॉक, सुशांत लोक-1',
  'H.No-206 Sushant Lok-1': 'मकान नं. 206, सुशांत लोक-1',

  // Ward 23
  'Sector-28 Main Junction': 'सेक्टर-28 मुख्य जंक्शन',
  'Sector-28': 'सेक्टर-28',
  'Opposite Sheeba Apartment GH-I Sec 28': 'शीबा अपार्टमेंट GH-I के सामने, सेक्टर 28',
  'Sheeba Apartment GH-I Sector 28': 'शीबा अपार्टमेंट GH-I, सेक्टर 28',
  'Chakarpur Mandir near DLF-I': 'चक्करपुर मंदिर, डीएलएफ-I के पास',
  'Near DLF-I Chakarpur Mandir': 'डीएलएफ-I चक्करपुर मंदिर के पास',

  // Ward 24
  'Gulab Park Rd near H.No 336 Sushant Lok': 'गुलाब पार्क रोड, मकान नं. 336 के पास, सुशांत लोक',
  'H.No 336 Sushant Lok': 'मकान नं. 336, सुशांत लोक',
  'Near Govt School Kanhai': 'सरकारी स्कूल के पास, कन्हई',
  'Near Tularam Market Kanhai': 'तुलाराम मार्केट के पास, कन्हई',
  'Near H.No. 1637 Sector-45': 'मकान नं. 1637 के पास, सेक्टर-45',
  'H.No 1637 Sector-45': 'मकान नं. 1637, सेक्टर-45',
  'Silokhera Village Road': 'सिलोखेड़ा गाँव रोड',
  'Entry Road Silokhera': 'सिलोखेड़ा प्रवेश रोड',
  'C-Block near H.No C-111 South City-I': 'सी-ब्लॉक, मकान नं. C-111 के पास, साउथ सिटी-I',
  'H.No C-111 South City-I': 'मकान नं. C-111, साउथ सिटी-I',
  'South City Main Market Road': 'साउथ सिटी मुख्य मार्केट रोड',
  'Main Market South City-I': 'मुख्य मार्केट, साउथ सिटी-I',

  // Ward 25
  'Sector 17A behind Naveen Goyal House 1832': 'सेक्टर 17A, नवीन गोयल आवास 1832 के पीछे',
  'Sec 17A House No 1832': 'सेक्टर 17A, मकान नं. 1832',
  'Sector 17B near House No 856': 'सेक्टर 17B, मकान नं. 856 के पास',
  'House No 856 Sec 17B': 'मकान नं. 856, सेक्टर 17B',
  'IDC Sector 16 near GIA House': 'आईडीसी सेक्टर 16, जीआईए हाउस के पास',
  'Near GIA House IDC Sec 16': 'जीआईए हाउस के पास, आईडीसी सेक्टर 16',
  'Old DLF Sec 14 Airforce School Gate': 'ओल्ड डीएलएफ सेक्टर 14, एयरफोर्स स्कूल गेट',
  'Sunder Singh Marg Airforce School': 'सुंदर सिंह मार्ग, एयरफोर्स स्कूल',

  // Ward 26
  'CRPF Camp Chowk': 'सीआरपीएफ कैंप चौक',
  'CRPF Chowk': 'सीआरपीएफ चौक',
  'Shiv Mandir Ram Mandir Chowk': 'शिव मंदिर - राम मंदिर चौक',
  'Ram Mandir Chowk': 'राम मंदिर चौक',

  // Ward 27
  'Jyoti Hospital Near Ganpati Enclave': 'ज्योति अस्पताल, गणपति एन्क्लेव के पास',
  'Jyoti Hospital Ganpati Enclave': 'ज्योति अस्पताल, गणपति एन्क्लेव',
  'Vinayak Plaza Patel Nagar': 'विनायक प्लाजा, पटेल नगर',
  'Maharaja Agrasen Chowk': 'महाराजा अग्रसेन चौक',
  'Baraf Khana': 'बरफ खाना',
  'Court Road': 'कोर्ट रोड',
  'Women Hostel Civil Lines': 'महिला छात्रावास, सिविल लाइंस',

  // Ward 28–31
  'Raj Nagar Chowk': 'राज नगर चौक',
  'Firoz Gandhi Colony near Bada Park': 'फिरोज गांधी कॉलोनी, बड़ा पार्क के पास',
  'Firoz Gandhi Colony Bada Park': 'फिरोज गांधी कॉलोनी बड़ा पार्क',
  'Near Beri Wala Bagh Shivaji Nagar': 'बेरी वाला बाग के पास, शिवाजी नगर',
  'Beri Wala Bagh Shivaji Nagar': 'बेरी वाला बाग, शिवाजी नगर',
  'Madanpuri Gali No. 11': 'मदनपुरी गली नं. 11',
  'Madanpuri Road near Madan Lal Grover House': 'मदनपुरी रोड, मदन लाल ग्रोवर आवास के पास',
  'Madan Lal Grover House Madanpuri': 'मदन लाल ग्रोवर आवास, मदनपुरी',
  'Auto Market Bhim Nagar': 'ऑटो मार्केट, भीम नगर',
  'Rajwanshi Hotel Subhash Nagar': 'राजवंशी होटल, सुभाष नगर',
  'Miya Wali Colony': 'मियाँ वाली कॉलोनी',

  // Ward 32
  'Krishna Colony Gali No. 09': 'कृष्णा कॉलोनी, गली नं. 09',
  'Kataria Market Sector-7 Extension': 'कटारिया मार्केट, सेक्टर-7 एक्सटेंशन',
  'Kataria Market Sec-7 Ext': 'कटारिया मार्केट, सेक्टर-7 एक्सटेंशन',
  'New Colony near Gaba Kothi': 'न्यू कॉलोनी, गाबा कोठी के पास',
  'New Colony Gaba Kothi': 'न्यू कॉलोनी, गाबा कोठी',

  // Ward 33
  'Gali No. 17 Surat Nagar Phase-I': 'गली नं. 17, सूरत नगर फेज-I',
  'Surat Nagar Phase-I Gali 17': 'सूरत नगर फेज-I गली 17',
  'Block-B Gali No. 72 Laxman Vihar': 'ब्लॉक-B, गली नं. 72, लक्ष्मण विहार',
  'Block-B Gali 72 Laxman Vihar': 'ब्लॉक-B गली 72, लक्ष्मण विहार',
  'Service Road along Flyover Laxman Vihar': 'फ्लाईओवर सर्विस रोड, लक्ष्मण विहार',
  'Flyover Service Rd Laxman Vihar': 'फ्लाईओवर सर्विस रोड, लक्ष्मण विहार',
  'Main Railway Road Laxman Vihar': 'मुख्य रेलवे रोड, लक्ष्मण विहार',
  'HUDA Market near ICICI Bank Sector-04': 'हुडा मार्केट, आईसीआईसीआई बैंक के पास, सेक्टर-04',
  'HUDA Market ICICI Bank Sec-04': 'हुडा मार्केट आईसीआईसीआई बैंक, सेक्टर-04',
  'HUDA Market Sector-04 Inner Lane': 'हुडा मार्केट सेक्टर-04 अंदरूनी गली',
  'HUDA Market Sector-04': 'हुडा मार्केट, सेक्टर-04',

  // Ward 34
  'Gopi Pandit Wali Gali Rajendra Park': 'गोपी पंडित वाली गली, राजेंद्र पार्क',
  'A-Block Park Wali Gali Rajendra Park': 'ए-ब्लॉक पार्क वाली गली, राजेंद्र पार्क',
  'A-Block Rajendra Park': 'ए-ब्लॉक, राजेंद्र पार्क',
  'Near Vishkarma Mandir Rajendra Park': 'विश्वकर्मा मंदिर के पास, राजेंद्र पार्क',
  'Vishkarma Mandir Rajendra Park': 'विश्वकर्मा मंदिर, राजेंद्र पार्क',
  'Near Gol Chakkar Rajendra Park': 'गोल चक्कर के पास, राजेंद्र पार्क',
  'Gol Chakkar Rajendra Park': 'गोल चक्कर, राजेंद्र पार्क',
  'G-Block Ekta Market Rajendra Park': 'जी-ब्लॉक एकता मार्केट, राजेंद्र पार्क',
  'Ekta Market Rajendra Park': 'एकता मार्केट, राजेंद्र पार्क',
  'Toyota Showroom Wali Gali Rajendra Park': 'टोयोटा शोरूम वाली गली, राजेंद्र पार्क',
  'Toyota Showroom Wali Gali': 'टोयोटा शोरूम वाली गली',
  'Gali No. 10 Surat Nagar Phase-I': 'गली नं. 10, सूरत नगर फेज-I',
  'Surat Nagar Phase-I Gali 10': 'सूरत नगर फेज-I गली 10',
  'Gali No. 9 Surat Nagar Phase-I': 'गली नं. 9, सूरत नगर फेज-I',
  'Surat Nagar Phase-I Gali 9': 'सूरत नगर फेज-I गली 9',
  'Gali No. 3 Surat Nagar Phase-I': 'गली नं. 3, सूरत नगर फेज-I',
  'Surat Nagar Phase-I Gali 3': 'सूरत नगर फेज-I गली 3',
  'Gali No. 8 Surat Nagar Phase-I': 'गली नं. 8, सूरत नगर फेज-I',
  'Surat Nagar Phase-I Gali 8': 'सूरत नगर फेज-I गली 8',
  'Gali No. 17 Surat Nagar Phase-I (W34)': 'गली नं. 17, सूरत नगर फेज-I (वार्ड 34)',

  // Ward 35
  'Sector 5 Part 6': 'सेक्टर 5 पार्ट-6',
  'Sector 5 Part 3': 'सेक्टर 5 पार्ट-3',
  'Chintpurni Mata Mandir': 'चिंतपूर्णी माता मंदिर',
  'Chintpurni Mata Mandir Sec 5': 'चिंतपूर्णी माता मंदिर, सेक्टर 5',
  'Khedi Sarkari School': 'खेड़ी सरकारी स्कूल',
  'Durga Sweets Khedi': 'दुर्गा स्वीट्स, खेड़ी',
  'Durga Sweets Bhimgarh Khedi': 'दुर्गा स्वीट्स, भीमगढ़ खेड़ी',
  'Bhimgarh Khedi Ashoka Apartment': 'भीमगढ़ खेड़ी, अशोका अपार्टमेंट',
  'Ashoka Apartment Bhimgarh Khedi': 'अशोका अपार्टमेंट, भीमगढ़ खेड़ी',
  'Gali No. 11 & 12 Bhimgarh Kheri': 'गली नं. 11 व 12, भीमगढ़ खेड़ी',
  'Gali No 11-12 Bhimgarh Kheri': 'गली नं. 11-12, भीमगढ़ खेड़ी',
  'Sec 5 Market': 'सेक्टर 5 मार्केट',
  'Sector 5 Market': 'सेक्टर 5 मार्केट',

  // Ward 36
  'Sheetla Mandir Road': 'शीतला मंदिर रोड',
  'J Block Ashok Vihar Phase-III': 'जे-ब्लॉक, अशोक विहार फेज-III',
  'Shingha Chowk': 'सिंघा चौक',
  'Ashok Vihar Phase-II near Chotu Ram Chowk': 'अशोक विहार फेज-II, छोटू राम चौक के पास',
  'Chotu Ram Chowk Ashok Vihar II': 'छोटू राम चौक, अशोक विहार-II',

  // General / Seeded / Crew Locations
  'Gurugram Street': 'गुरुग्राम सड़क',
  'Gurugram General': 'संपूर्ण गुरुग्राम',
  'Gurugram Live GPS': 'गुरुग्राम लाइव जीपीएस',
  'Sector 10 GMDA Bus Stand Yard': 'सेक्टर 10 जीएमडीए बस स्टैंड यार्ड',
  'Basai / Sector-9A Depot': 'बसई / सेक्टर-9A डिपो',
  'Civil Lines / Sheetla Mata Yard': 'सिविल लाइंस / शीतला माता यार्ड',
  'Wazirabad / Sector 56 Sub-Depot': 'वज़ीराबाद / सेक्टर 56 उप-डिपो',
};

const CORRIDOR_LABEL_HI: Record<string, string> = {
  'nh48-udhyog': 'उद्योग विहार / डूंडाहेड़ा → सेक्टर 18',
  'old-gurgaon-sheetla': 'शीतला माता रोड → भीम नगर / बस स्टैंड',
  'golf-course-wazirabad': 'चक्करपुर / सेक्टर 28 → वज़ीराबाद / घाटा',
  'sohna-badshahpur': 'वाटिका चौक → सोहना रोड / साउथ सिटी II',
};

const PHRASE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bGurugram GPS\b/gi, 'गुरुग्राम जीपीएस'],
  [/\bGurugram\b/gi, 'गुरुग्राम'],
  [/\bGurgaon\b/gi, 'गुड़गाँव'],
  [/\bWard\s*(\d+)/gi, 'वार्ड $1'],
  [/\bZone\s*(\d+)/gi, 'ज़ोन $1'],
  [/\bSector[-\s]?(\d+[A-Za-z]?)/gi, 'सेक्टर-$1'],
  [/\bSec[-\s]?(\d+[A-Za-z]?)/gi, 'सेक्टर-$1'],
  [/\bGali\s*No\.?\s*/gi, 'गली नं. '],
  [/\bGate\s*No\.?\s*/gi, 'गेट नं. '],
  [/\bHouse\s*No\.?\s*/gi, 'मकान नं. '],
  [/\bH\.?\s*No\.?\s*/gi, 'मकान नं. '],
  [/\bPhase[-\s]?/gi, 'फेज-'],
  [/\bBlock\b/gi, 'ब्लॉक'],
  [/\bUnder\s*Pass\b/gi, 'अंडरपास'],
  [/\bUnderpass\b/gi, 'अंडरपास'],
  [/\bChowk\b/gi, 'चौक'],
  [/\bMandir\b/gi, 'मंदिर'],
  [/\bMasjid\b/gi, 'मस्जिद'],
  [/\bRoad\b/gi, 'रोड'],
  [/\bRd\b/gi, 'रोड'],
  [/\bMarg\b/gi, 'मार्ग'],
  [/\bGali\b/gi, 'गली'],
  [/\bVillage\b/gi, 'गाँव'],
  [/\bMarket\b/gi, 'मार्केट'],
  [/\bSchool\b/gi, 'स्कूल'],
  [/\bHospital\b/gi, 'अस्पताल'],
  [/\bPark\b/gi, 'पार्क'],
  [/\bColony\b/gi, 'कॉलोनी'],
  [/\bEnclave\b/gi, 'एन्क्लेव'],
  [/\bVihar\b/gi, 'विहार'],
  [/\bNagar\b/gi, 'नगर'],
  [/\bCommunity\s*Cent(?:re|er)\b/gi, 'कम्युनिटी सेंटर'],
  [/\bBus\s*Stand\b/gi, 'बस स्टैंड'],
  [/\bMetro\s*Station\b/gi, 'मेट्रो स्टेशन'],
  [/\bFlyover\b/gi, 'फ्लाईओवर'],
  [/\bService\b/gi, 'सर्विस'],
  [/\bJunction\b/gi, 'जंक्शन'],
  [/\bMain\b/gi, 'मुख्य'],
  [/\bNear\b/gi, 'के पास'],
  [/\bIn\s*front\s*of\b/gi, 'के सामने'],
  [/\bOpposite\b/gi, 'के सामने'],
  [/\bBehind\b/gi, 'के पीछे'],
  [/\bWazirabad\b/gi, 'वज़ीराबाद'],
  [/\bDundahera\b/gi, 'डूंडाहेड़ा'],
  [/\bChakkarpur\b/gi, 'चक्करपुर'],
  [/\bBadshahpur\b/gi, 'बादशाहपुर'],
  [/\bPalam Vihar\b/gi, 'पालम विहार'],
  [/\bSushant Lok\b/gi, 'सुशांत लोक'],
  [/\bSouth City\b/gi, 'साउथ सिटी'],
  [/\bRajendra Park\b/gi, 'राजेंद्र पार्क'],
  [/\bLaxman Vihar\b/gi, 'लक्ष्मण विहार'],
  [/\bSurat Nagar\b/gi, 'सूरत नगर'],
  [/\bBhim Nagar\b/gi, 'भीम नगर'],
  [/\bSheetla\b/gi, 'शीतला'],
  [/\bGhata\b/gi, 'घाटा'],
  [/\bVatika\b/gi, 'वाटिका'],
  [/\bSohna\b/gi, 'सोहना'],
];

export function localizeLocationName(text: string, lang: Lang): string {
  if (lang === 'en' || !text) return text;
  const trimmed = text.trim();
  if (EXACT_LOCATION_HI[trimmed]) return EXACT_LOCATION_HI[trimmed];

  // Handle "Ward X · Name" or "Ward X (Zone Y) — Name" composite labels cleanly
  const wardPrefixMatch = trimmed.match(/^Ward\s+(\d+)\s*(?:\(Zone\s+(\d+)\))?\s*([·—-])\s*(.+)$/i);
  if (wardPrefixMatch) {
    const [, wardNum, zoneNum, sep, rest] = wardPrefixMatch;
    const zoneStr = zoneNum ? ` (ज़ोन ${zoneNum})` : '';
    return `वार्ड ${wardNum}${zoneStr} ${sep} ${localizeLocationName(rest, lang)}`;
  }

  let out = trimmed;
  for (const [pattern, replacement] of PHRASE_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

export function getHotspotDisplayName(hotspot: Pick<McgHotspot, 'name'>, lang: Lang): string {
  return localizeLocationName(hotspot.name, lang);
}

export function getHotspotDisplayLandmark(
  hotspot: Pick<McgHotspot, 'landmark'>,
  lang: Lang
): string {
  return localizeLocationName(hotspot.landmark, lang);
}

export function getCorridorLabel(preset: { id: string; label: string }, lang: Lang): string {
  if (lang === 'en') return preset.label;
  return CORRIDOR_LABEL_HI[preset.id] || localizeLocationName(preset.label, lang);
}

export function formatWardLabel(wardNo: number, lang: Lang): string {
  return lang === 'hi' ? `वार्ड ${wardNo}` : `Ward ${wardNo}`;
}

export function formatZoneLabel(zone: number, lang: Lang): string {
  return lang === 'hi' ? `ज़ोन ${zone}` : `Zone ${zone}`;
}

const EXACT_CAUSE_HI: Record<string, string> = {
  'Water drain out through sewer line, no master drain is available in adjoining area.':
    'सीवर लाइन से पानी निकलता है; आसपास के क्षेत्र में कोई मास्टर ड्रेन उपलब्ध नहीं है।',
  'Water logging occurs due to road level difference.':
    'सड़क के स्तर (लेवल) में अंतर के कारण जलभराव होता है।',
  'It is a low lying area, no storm water drain is available in adjoining area.':
    'यह निचला इलाका है और आसपास के क्षेत्र में कोई स्टॉर्म वाटर ड्रेन उपलब्ध नहीं है।',
  'Low lying area, approx 4 feet deeper than main road and storm water is drained out through pumping.':
    'निचला इलाका, मुख्य सड़क से लगभग 4 फीट गहरा है; वर्षा जल पंपिंग के जरिए निकाला जाता है।',
  'Low lying area, main storm water drain is being de-silted.':
    'निचला इलाका; मुख्य स्टॉर्म वाटर ड्रेन से गाद (सिल्ट) निकालने का कार्य चल रहा है।',
  'Low lying area, GMDA has constructed storm water drain along Sanath road, but cleaning is required.':
    'निचला इलाका; जीएमडीए ने सनथ रोड के साथ नाला बनाया है, लेकिन सफाई की आवश्यकता है।',
  'Water logging due to low lying area, storm water drain is silted up and in damaged condition.':
    'निचले इलाके के कारण जलभराव; स्टॉर्म वाटर ड्रेन में गाद भरी है और क्षतिग्रस्त स्थिति में है।',
  'Water logging due to low lying area, storm water drain is silted up and damaged condition.':
    'निचले इलाके के कारण जलभराव; स्टॉर्म वाटर ड्रेन गाद से भरा और क्षतिग्रस्त है।',
  'Water logging due to low lying area, storm water drain has been proposed for permanent solution.':
    'निचले इलाके के कारण जलभराव; स्थायी समाधान के लिए स्टॉर्म वाटर ड्रेन प्रस्तावित है।',
  'Water logging occurs due to blockage of GMDA storm water drain.':
    'जीएमडीए स्टॉर्म वाटर ड्रेन में रुकावट (ब्लॉकेज) के कारण जलभराव होता है।',
  'Water logging due to low lying area.': 'निचले इलाके के कारण जलभराव होता है।',
  'Water logging due to low lying area': 'निचले इलाके के कारण जलभराव होता है।',
  'Low lying area and silt in drains.': 'निचला इलाका और नालियों में गाद जमा होना।',
  'Low lying area.': 'निचला इलाका।',
  'Water logging due to silt in drain.': 'नाले में गाद जमा होने के कारण जलभराव।',
  'Low lying area & drain block.': 'निचला इलाका और नाला अवरुद्ध होना।',
  'Drainage block.': 'ड्रेनेज अवरुद्ध (ब्लॉक) होना।',
  'Water occurs due to low lying area in green belt of NH-8 and adjoining area.':
    'NH-8 के ग्रीन बेल्ट और आसपास के निचले क्षेत्र के कारण पानी भरता है।',
  'No sewer line and drainage.': 'कोई सीवर लाइन और ड्रेनेज व्यवस्था नहीं है।',
  'Newly approved as well as low lying. Road surface water accumulates to this point.':
    'नव-अनुमोदित एवं निचला क्षेत्र; सड़क की सतह का पानी यहाँ एकत्र होता है।',
  'Newly approved colony is uneven, due to which rain water accumulates at different locations.':
    'नव-अनुमोदित कॉलोनी की सतह असमान होने से विभिन्न स्थानों पर वर्षा जल भर जाता है।',
  'Low lying area. Newly approved and there is no provision of storm water drainage and sewerage line.':
    'निचला इलाका। नव-अनुमोदित कॉलोनी में स्टॉर्म वाटर ड्रेनेज व सीवरेज लाइन की व्यवस्था नहीं है।',
  'Low lying area and all rain water runoff on internal society roads accumulates to this point.':
    'निचला इलाका; सोसायटी की आंतरिक सड़कों का सारा वर्षा जल यहीं एकत्र होता है।',
  'The surface of this road is uneven due to which water accumulated at different patches.':
    'इस सड़क की सतह असमान है, जिससे अलग-अलग हिस्सों में पानी जमा हो जाता है।',
  'GMDA master line backflows during rain. Once the drain starts taking water, water logging clears.':
    'बारिश के दौरान जीएमडीए मास्टर लाइन में बैकफ्लो होता है; निकासी शुरू होते ही जलभराव साफ हो जाता है।',
  'Low lying area and water runoff of the village accumulates at this point.':
    'निचला इलाका; गाँव के पानी का बहाव इसी स्थान पर एकत्र होता है।',
  'Low lying area and water runoff of the society accumulates at this point.':
    'निचला इलाका; सोसायटी का वर्षा जल इसी स्थान पर एकत्र होता है।',
  'Storm drainage cleaning required.': 'स्टॉर्म ड्रेनेज की सफाई आवश्यक है।',
  'Water comes from Chakkarpur village.': 'चक्करपुर गाँव की ओर से पानी आता है।',
  'GMDA Chakkarpur Bandh overflow.': 'जीएमडीए चक्करपुर बांध का ओवरफ्लो।',
  'Overflow of main GMDA line.': 'मुख्य जीएमडीए लाइन का ओवरफ्लो।',
  'De-silting of drains and proper connectivity with Master drain required.':
    'नालियों की सफाई (डी-सिल्टिंग) और मास्टर ड्रेन से उचित जुड़ाव आवश्यक है।',
  'Telecom cables are crossing the drainage line and producing hurdle in dewatering.':
    'ड्रेनेज लाइन के आर-पार टेलीकॉम केबल होने से जल निकासी में बाधा आ रही है।',
  'Topographical road level is low from main road and drainage system is non-functional.':
    'मुख्य सड़क की तुलना में सड़क का स्तर नीचा है और ड्रेनेज प्रणाली निष्क्रिय है।',
  'Critical point.': 'अति संवेदनशील (क्रिटिकल) बिंदु।',
  'Normal point.': 'सामान्य बिंदु।',
};

export function getCauseAnalysis(cause: string, lang: Lang): string {
  if (lang === 'en' || !cause) return cause;
  const trimmed = cause.trim();
  if (EXACT_CAUSE_HI[trimmed]) return EXACT_CAUSE_HI[trimmed];
  return localizeLocationName(trimmed, lang);
}
