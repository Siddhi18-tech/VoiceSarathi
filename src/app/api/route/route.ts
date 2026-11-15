import { NextResponse } from "next/server";
import { isLatitude, isLongitude } from "@/lib/validation";

type Coordinate = { latitude: number; longitude: number };

// -------------------------------------------------------------
// Kolkata Curated Landmarks, Bridges, Flyovers & Arterial Roads
// Fast, offline-guaranteed pinpoint coordinates for Kolkata
// -------------------------------------------------------------
const KOLKATA_LANDMARKS: Record<string, { name: string; lat: number; lng: number }> = {
  // Bridges & Flyovers (Key Kolkata Reroute Corridors)
  "howrah bridge": { name: "Howrah Bridge (Rabindra Setu)", lat: 22.5851, lng: 88.3468 },
  "rabindra setu": { name: "Howrah Bridge (Rabindra Setu)", lat: 22.5851, lng: 88.3468 },
  "হাওড়া ব্রিজ": { name: "Howrah Bridge (Rabindra Setu)", lat: 22.5851, lng: 88.3468 },
  "রবীন্দ্র সেতু": { name: "Howrah Bridge (Rabindra Setu)", lat: 22.5851, lng: 88.3468 },
  "हावड़ा ब्रिज": { name: "Howrah Bridge (Rabindra Setu)", lat: 22.5851, lng: 88.3468 },

  "vidyasagar setu": { name: "Vidyasagar Setu (2nd Hooghly Bridge)", lat: 22.5542, lng: 88.3242 },
  "second hooghly bridge": { name: "Vidyasagar Setu (2nd Hooghly Bridge)", lat: 22.5542, lng: 88.3242 },
  "2nd hooghly bridge": { name: "Vidyasagar Setu (2nd Hooghly Bridge)", lat: 22.5542, lng: 88.3242 },
  "বিদ্যাসাগর সেতু": { name: "Vidyasagar Setu (2nd Hooghly Bridge)", lat: 22.5542, lng: 88.3242 },
  "विद्यासागर सेतु": { name: "Vidyasagar Setu (2nd Hooghly Bridge)", lat: 22.5542, lng: 88.3242 },

  "maa flyover": { name: "Maa Flyover (Parama)", lat: 22.5445, lng: 88.3812 },
  "parama flyover": { name: "Maa Flyover (Parama)", lat: 22.5445, lng: 88.3812 },
  "মা ফ্লাইওভার": { name: "Maa Flyover (Parama)", lat: 22.5445, lng: 88.3812 },
  "मां फ्लाईओवर": { name: "Maa Flyover (Parama)", lat: 22.5445, lng: 88.3812 },

  "em bypass": { name: "Eastern Metropolitan Bypass", lat: 22.5298, lng: 88.4005 },
  "bypass": { name: "Eastern Metropolitan Bypass", lat: 22.5298, lng: 88.4005 },
  "ইএম বাইপাস": { name: "Eastern Metropolitan Bypass", lat: 22.5298, lng: 88.4005 },
  "बाईपास": { name: "Eastern Metropolitan Bypass", lat: 22.5298, lng: 88.4005 },
  "ईएम बाईपास": { name: "Eastern Metropolitan Bypass", lat: 22.5298, lng: 88.4005 },

  "ajc bose road": { name: "AJC Bose Road Flyover", lat: 22.5401, lng: 88.3540 },
  "ajc bose road flyover": { name: "AJC Bose Road Flyover", lat: 22.5401, lng: 88.3540 },
  "এজেসি বোস রোড": { name: "AJC Bose Road Flyover", lat: 22.5401, lng: 88.3540 },

  "red road": { name: "Red Road, Maidan", lat: 22.5540, lng: 88.3470 },
  "রেড রোড": { name: "Red Road, Maidan", lat: 22.5540, lng: 88.3470 },
  "रेड रोड": { name: "Red Road, Maidan", lat: 22.5540, lng: 88.3470 },

  "strand road": { name: "Strand Road, Hooghly Riverfront", lat: 22.5700, lng: 88.3440 },
  "স্ট্র্যান্ড রোড": { name: "Strand Road, Hooghly Riverfront", lat: 22.5700, lng: 88.3440 },

  "central avenue": { name: "Chittaranjan Avenue (Central Ave)", lat: 22.5800, lng: 88.3600 },
  "cr avenue": { name: "Chittaranjan Avenue (Central Ave)", lat: 22.5800, lng: 88.3600 },

  "mg road": { name: "Mahatma Gandhi Road", lat: 22.5840, lng: 88.3650 },
  "एमजी रोड": { name: "Mahatma Gandhi Road", lat: 22.5840, lng: 88.3650 },
  "মহাত্মা গান্ধী রোড": { name: "Mahatma Gandhi Road", lat: 22.5840, lng: 88.3650 },

  "vip road": { name: "VIP Road, Kankurgachi/Airport", lat: 22.6050, lng: 88.4200 },
  "ভিআইপি রোড": { name: "VIP Road, Kankurgachi/Airport", lat: 22.6050, lng: 88.4200 },
  "वीआईपी रोड": { name: "VIP Road, Kankurgachi/Airport", lat: 22.6050, lng: 88.4200 },

  "prince anwar shah road": { name: "Prince Anwar Shah Road", lat: 22.5020, lng: 88.3550 },
  "প্রিন্স আনোয়ার শাহ রোড": { name: "Prince Anwar Shah Road", lat: 22.5020, lng: 88.3550 },
  "प्रिंस अनवर शाह रोड": { name: "Prince Anwar Shah Road", lat: 22.5020, lng: 88.3550 },

  // Malls & Hubs
  "south city": { name: "South City Mall, Kolkata", lat: 22.5016, lng: 88.3617 },
  "south city mall": { name: "South City Mall, Kolkata", lat: 22.5016, lng: 88.3617 },
  "साउथ सिटी": { name: "South City Mall, Kolkata", lat: 22.5016, lng: 88.3617 },
  "साउथ सिटी मॉल": { name: "South City Mall, Kolkata", lat: 22.5016, lng: 88.3617 },
  "সাউথ সিটি": { name: "South City Mall, Kolkata", lat: 22.5016, lng: 88.3617 },
  "সাউথ সিটি মল": { name: "South City Mall, Kolkata", lat: 22.5016, lng: 88.3617 },

  "quest mall": { name: "Quest Mall, Park Circus", lat: 22.5392, lng: 88.3658 },
  "কোয়েস্ট মল": { name: "Quest Mall, Park Circus", lat: 22.5392, lng: 88.3658 },
  "क्वेस्ट मॉल": { name: "Quest Mall, Park Circus", lat: 22.5392, lng: 88.3658 },

  "mani square": { name: "Mani Square Mall, EM Bypass", lat: 22.5768, lng: 88.4018 },
  "মণি স্কয়ার": { name: "Mani Square Mall, EM Bypass", lat: 22.5768, lng: 88.4018 },
  "मणि स्क्वायर": { name: "Mani Square Mall, EM Bypass", lat: 22.5768, lng: 88.4018 },

  "acropolis": { name: "Acropolis Mall, Kasba", lat: 22.5152, lng: 88.3932 },
  "acropolis mall": { name: "Acropolis Mall, Kasba", lat: 22.5152, lng: 88.3932 },
  "অ্যাক্রোপলিস": { name: "Acropolis Mall, Kasba", lat: 22.5152, lng: 88.3932 },
  "एक्रोपोलिस": { name: "Acropolis Mall, Kasba", lat: 22.5152, lng: 88.3932 },

  "city centre 1": { name: "City Centre 1, Salt Lake", lat: 22.5898, lng: 88.4087 },
  "cc1": { name: "City Centre 1, Salt Lake", lat: 22.5898, lng: 88.4087 },
  "সিটি সেন্টার ১": { name: "City Centre 1, Salt Lake", lat: 22.5898, lng: 88.4087 },
  "सिटी सेंटर": { name: "City Centre 1, Salt Lake", lat: 22.5898, lng: 88.4087 },

  "city centre 2": { name: "City Centre 2, New Town", lat: 22.6288, lng: 88.4552 },
  "cc2": { name: "City Centre 2, New Town", lat: 22.6288, lng: 88.4552 },
  "সিটি সেন্টার ২": { name: "City Centre 2, New Town", lat: 22.6288, lng: 88.4552 },

  // Railway Stations & Transit Hubs
  "howrah": { name: "Howrah Railway Station", lat: 22.5833, lng: 88.3403 },
  "howrah station": { name: "Howrah Railway Station", lat: 22.5833, lng: 88.3403 },
  "হাওড়া": { name: "Howrah Railway Station", lat: 22.5833, lng: 88.3403 },
  "হাওড়া স্টেশন": { name: "Howrah Railway Station", lat: 22.5833, lng: 88.3403 },
  "हावड़ा": { name: "Howrah Railway Station", lat: 22.5833, lng: 88.3403 },
  "हावड़ा स्टेशन": { name: "Howrah Railway Station", lat: 22.5833, lng: 88.3403 },

  "sealdah": { name: "Sealdah Railway Station", lat: 22.5670, lng: 88.3712 },
  "sealdah station": { name: "Sealdah Railway Station", lat: 22.5670, lng: 88.3712 },
  "শিয়ালদহ": { name: "Sealdah Railway Station", lat: 22.5670, lng: 88.3712 },
  "सियालदह": { name: "Sealdah Railway Station", lat: 22.5670, lng: 88.3712 },

  "airport": { name: "Netaji Subhash Chandra Bose Airport", lat: 22.6547, lng: 88.4467 },
  "kolkata airport": { name: "Netaji Subhash Chandra Bose Airport", lat: 22.6547, lng: 88.4467 },
  "dum dum airport": { name: "Netaji Subhash Chandra Bose Airport", lat: 22.6547, lng: 88.4467 },
  "বিমানবন্দর": { name: "Netaji Subhash Chandra Bose Airport", lat: 22.6547, lng: 88.4467 },
  "कोलकाता एयरपोर्ट": { name: "Netaji Subhash Chandra Bose Airport", lat: 22.6547, lng: 88.4467 },
  "एयरपोर्ट": { name: "Netaji Subhash Chandra Bose Airport", lat: 22.6547, lng: 88.4467 },

  "esplanade": { name: "Esplanade / Dharmatala", lat: 22.5645, lng: 88.3520 },
  "dharmatala": { name: "Esplanade / Dharmatala", lat: 22.5645, lng: 88.3520 },
  "এসপ্ল্যানেড": { name: "Esplanade / Dharmatala", lat: 22.5645, lng: 88.3520 },
  "धर्मतला": { name: "Esplanade / Dharmatala", lat: 22.5645, lng: 88.3520 },

  "shyambazar": { name: "Shyambazar Five Point", lat: 22.6014, lng: 88.3704 },
  "শ্যামবাজার": { name: "Shyambazar Five Point", lat: 22.6014, lng: 88.3704 },
  "श्यामबाजार": { name: "Shyambazar Five Point", lat: 22.6014, lng: 88.3704 },

  "gariahat": { name: "Gariahat Crossing", lat: 22.5186, lng: 88.3653 },
  "গড়িয়াহাট": { name: "Gariahat Crossing", lat: 22.5186, lng: 88.3653 },
  "गड़ियाहाट": { name: "Gariahat Crossing", lat: 22.5186, lng: 88.3653 },

  // Monuments, Parks & Temples
  "victoria": { name: "Victoria Memorial", lat: 22.5448, lng: 88.3426 },
  "victoria memorial": { name: "Victoria Memorial", lat: 22.5448, lng: 88.3426 },
  "ভিক্টোরিয়া": { name: "Victoria Memorial", lat: 22.5448, lng: 88.3426 },
  "ভিক্টোরিয়া মেমোরিয়াল": { name: "Victoria Memorial", lat: 22.5448, lng: 88.3426 },
  "विक्टोरिया": { name: "Victoria Memorial", lat: 22.5448, lng: 88.3426 },
  "विक्टोरिया मेमोरियल": { name: "Victoria Memorial", lat: 22.5448, lng: 88.3426 },

  "science city": { name: "Science City Kolkata", lat: 22.5397, lng: 88.3957 },
  "সায়েন্স সিটি": { name: "Science City Kolkata", lat: 22.5397, lng: 88.3957 },
  "साइंस सिटी": { name: "Science City Kolkata", lat: 22.5397, lng: 88.3957 },

  "eco park": { name: "Eco Park New Town", lat: 22.6006, lng: 88.4682 },
  "ইকো পার্ক": { name: "Eco Park New Town", lat: 22.6006, lng: 88.4682 },
  "इको पार्क": { name: "Eco Park New Town", lat: 22.6006, lng: 88.4682 },

  "dakshineswar": { name: "Dakshineswar Kali Temple", lat: 22.6546, lng: 88.3575 },
  "dakshineswar temple": { name: "Dakshineswar Kali Temple", lat: 22.6546, lng: 88.3575 },
  "দক্ষিণেশ্বর": { name: "Dakshineswar Kali Temple", lat: 22.6546, lng: 88.3575 },
  "দক্ষিণেশ্বর মন্দির": { name: "Dakshineswar Kali Temple", lat: 22.6546, lng: 88.3575 },
  "दक्षिणेश्वर": { name: "Dakshineswar Kali Temple", lat: 22.6546, lng: 88.3575 },
  "दक्षिणेश्वर मंदिर": { name: "Dakshineswar Kali Temple", lat: 22.6546, lng: 88.3575 },

  "kalighat": { name: "Kalighat Kali Temple", lat: 22.5204, lng: 88.3426 },
  "কালীঘাট": { name: "Kalighat Kali Temple", lat: 22.5204, lng: 88.3426 },
  "कालीघाट": { name: "Kalighat Kali Temple", lat: 22.5204, lng: 88.3426 },

  "belur math": { name: "Belur Math", lat: 22.6322, lng: 88.3562 },
  "বেলুড় মঠ": { name: "Belur Math", lat: 22.6322, lng: 88.3562 },
  "बेलूर मठ": { name: "Belur Math", lat: 22.6322, lng: 88.3562 },

  "princep ghat": { name: "Princep Ghat", lat: 22.5552, lng: 88.3328 },
  "প্রিন্সেপ ঘাট": { name: "Princep Ghat", lat: 22.5552, lng: 88.3328 },
  "प्रिंसेप घाट": { name: "Princep Ghat", lat: 22.5552, lng: 88.3328 },

  "eden gardens": { name: "Eden Gardens Cricket Stadium", lat: 22.5646, lng: 88.3433 },
  "ইডেন গার্ডেন": { name: "Eden Gardens Cricket Stadium", lat: 22.5646, lng: 88.3433 },
  "ईडन गार्डन": { name: "Eden Gardens Cricket Stadium", lat: 22.5646, lng: 88.3433 },

  "alipore zoo": { name: "Alipore Zoological Garden", lat: 22.5361, lng: 88.3315 },
  "zoo": { name: "Alipore Zoological Garden", lat: 22.5361, lng: 88.3315 },
  "চিড়িয়াখানা": { name: "Alipore Zoological Garden", lat: 22.5361, lng: 88.3315 },
  "चिड़ियाघर": { name: "Alipore Zoological Garden", lat: 22.5361, lng: 88.3315 },

  "nicco park": { name: "Nicco Park, Salt Lake", lat: 22.5707, lng: 88.4230 },
  "নিকো পার্ক": { name: "Nicco Park, Salt Lake", lat: 22.5707, lng: 88.4230 },
  "निक्को पार्क": { name: "Nicco Park, Salt Lake", lat: 22.5707, lng: 88.4230 },

  "park street": { name: "Park Street, Kolkata", lat: 22.5516, lng: 88.3524 },
  "পার্ক স্ট্রিট": { name: "Park Street, Kolkata", lat: 22.5516, lng: 88.3524 },
  "पार्क स्ट्रीट": { name: "Park Street, Kolkata", lat: 22.5516, lng: 88.3524 },

  "college street": { name: "College Street (Boi Para)", lat: 22.5750, lng: 88.3630 },
  "কলেজ স্ট্রিট": { name: "College Street (Boi Para)", lat: 22.5750, lng: 88.3630 },
  "कॉलेज स्ट्रीट": { name: "College Street (Boi Para)", lat: 22.5750, lng: 88.3630 },

  "new market": { name: "New Market, Kolkata", lat: 22.5603, lng: 88.3523 },
  "নিউ মার্কেট": { name: "New Market, Kolkata", lat: 22.5603, lng: 88.3523 },
  "न्यू मार्केट": { name: "New Market, Kolkata", lat: 22.5603, lng: 88.3523 },

  // Hospitals & IT Hubs
  "ruby": { name: "Ruby General Hospital, EM Bypass", lat: 22.5135, lng: 88.4013 },
  "ruby hospital": { name: "Ruby General Hospital, EM Bypass", lat: 22.5135, lng: 88.4013 },
  "রুবি": { name: "Ruby General Hospital, EM Bypass", lat: 22.5135, lng: 88.4013 },
  "रुबी": { name: "Ruby General Hospital, EM Bypass", lat: 22.5135, lng: 88.4013 },

  "salt lake": { name: "Salt Lake (Bidhannagar)", lat: 22.5735, lng: 88.4331 },
  "sector 5": { name: "Salt Lake Sector V IT Hub", lat: 22.5735, lng: 88.4331 },
  "sector v": { name: "Salt Lake Sector V IT Hub", lat: 22.5735, lng: 88.4331 },
  "সল্টলেক": { name: "Salt Lake Sector V IT Hub", lat: 22.5735, lng: 88.4331 },
  "साल्ट लेक": { name: "Salt Lake Sector V IT Hub", lat: 22.5735, lng: 88.4331 },

  "new town": { name: "New Town, Action Area 1", lat: 22.5855, lng: 88.4688 },
  "নিউ টাউন": { name: "New Town, Action Area 1", lat: 22.5855, lng: 88.4688 },
  "न्यू टाउन": { name: "New Town, Action Area 1", lat: 22.5855, lng: 88.4688 },

  "jadavpur": { name: "Jadavpur University", lat: 22.4988, lng: 88.3716 },
  "যাদবপুর": { name: "Jadavpur University", lat: 22.4988, lng: 88.3716 },
  "जादवपुर": { name: "Jadavpur University", lat: 22.4988, lng: 88.3716 },
};

// -------------------------------------------------------------
// Kolkata Proximity POI Datasets for "Nearest X" Voice Queries
// -------------------------------------------------------------
const KOLKATA_METRO_STATIONS = [
  // Blue Line (North-South)
  { name: "Dakshineswar Metro Station", lat: 22.6548, lng: 88.3582 },
  { name: "Baranagar Metro Station", lat: 22.6455, lng: 88.3712 },
  { name: "Noapara Metro Station", lat: 22.6395, lng: 88.3905 },
  { name: "Dum Dum Metro Station", lat: 22.6225, lng: 88.3970 },
  { name: "Belgachia Metro Station", lat: 22.6075, lng: 88.3842 },
  { name: "Shyambazar Metro Station", lat: 22.6015, lng: 88.3715 },
  { name: "Shovabazar Sutanuti Metro Station", lat: 22.5970, lng: 88.3660 },
  { name: "Girish Park Metro Station", lat: 22.5865, lng: 88.3620 },
  { name: "Mahatma Gandhi Road (MG Road) Metro", lat: 22.5815, lng: 88.3605 },
  { name: "Central Metro Station", lat: 22.5695, lng: 88.3585 },
  { name: "Chandni Chowk Metro Station", lat: 22.5660, lng: 88.3540 },
  { name: "Esplanade Metro Station", lat: 22.5630, lng: 88.3515 },
  { name: "Park Street Metro Station", lat: 22.5515, lng: 88.3510 },
  { name: "Maidan Metro Station", lat: 22.5445, lng: 88.3490 },
  { name: "Rabindra Sadan Metro Station", lat: 22.5375, lng: 88.3465 },
  { name: "Netaji Bhavan Metro Station", lat: 22.5315, lng: 88.3450 },
  { name: "Jatin Das Park Metro Station", lat: 22.5235, lng: 88.3450 },
  { name: "Kalighat Metro Station", lat: 22.5185, lng: 88.3460 },
  { name: "Rabindra Sarobar Metro Station", lat: 22.5085, lng: 88.3470 },
  { name: "Mahanayak Uttam Kumar (Tollygunge) Metro", lat: 22.4975, lng: 88.3455 },
  { name: "Netaji (Kudghat) Metro Station", lat: 22.4865, lng: 88.3460 },
  { name: "Masterda Surya Sen (Bansdroni) Metro", lat: 22.4785, lng: 88.3480 },
  { name: "Gitanjali (Naktala) Metro Station", lat: 22.4705, lng: 88.3530 },
  { name: "Kavi Nazrul (Garia) Metro Station", lat: 22.4635, lng: 88.3680 },
  { name: "Shahid Khudiram Metro Station", lat: 22.4645, lng: 88.3795 },
  { name: "Kavi Subhash (New Garia) Metro Station", lat: 22.4725, lng: 88.3970 },

  // Green Line (East-West)
  { name: "Howrah Maidan Metro Station", lat: 22.5855, lng: 88.3300 },
  { name: "Howrah Railway Station Metro", lat: 22.5840, lng: 88.3415 },
  { name: "Sealdah Metro Station", lat: 22.5670, lng: 88.3710 },
  { name: "Phoolbagan Metro Station", lat: 22.5710, lng: 88.3895 },
  { name: "Salt Lake Stadium Metro Station", lat: 22.5715, lng: 88.4045 },
  { name: "Bengal Chemical Metro Station", lat: 22.5765, lng: 88.4110 },
  { name: "City Centre 1 Metro Station, Salt Lake", lat: 22.5885, lng: 88.4095 },
  { name: "Central Park Metro Station, Salt Lake", lat: 22.5890, lng: 88.4180 },
  { name: "Karunamoyee Metro Station", lat: 22.5865, lng: 88.4235 },
  { name: "Salt Lake Sector V Metro Station", lat: 22.5760, lng: 88.4325 },

  // Orange Line (Ruby / EM Bypass)
  { name: "Hemanta Mukhopadhyay (Ruby) Metro Station", lat: 22.5135, lng: 88.4013 },
  { name: "Kavi Sukanta Metro Station", lat: 22.4985, lng: 88.4005 },
  { name: "Jyotirindra Nandi Metro Station", lat: 22.4870, lng: 88.3995 },
  { name: "Satyajit Ray Metro Station", lat: 22.4780, lng: 88.3980 },

  // Purple Line
  { name: "Taratala Metro Station", lat: 22.5115, lng: 88.3180 },
  { name: "Behala Chowrasta Metro Station", lat: 22.4945, lng: 88.3120 },
  { name: "Majerhat Metro Station", lat: 22.5200, lng: 88.3245 },
  { name: "Joka Metro Station", lat: 22.4435, lng: 88.2930 },
];

const KOLKATA_FINE_DINE_CAFES = [
  { name: "Roastery Coffee House, Southern Avenue", lat: 22.5126, lng: 88.3618 },
  { name: "8th Day Cafe & Bakery, Park Circus", lat: 22.5398, lng: 88.3625 },
  { name: "Sienna Store & Cafe, Hindustan Park", lat: 22.5162, lng: 88.3620 },
  { name: "Flurys, Park Street", lat: 22.5524, lng: 88.3518 },
  { name: "Blue Tokai Coffee Roasters, Ballygunge", lat: 22.5312, lng: 88.3685 },
  { name: "The Salt House, Shakespeare Sarani", lat: 22.5458, lng: 88.3592 },
  { name: "Cafe Drifter, Lake Terrace", lat: 22.5140, lng: 88.3580 },
  { name: "Craft Coffee Experience Centre, Park Street", lat: 22.5510, lng: 88.3535 },
  { name: "Artsy - Coffee & Culture, Minto Park", lat: 22.5375, lng: 88.3540 },
  { name: "The Daily Cafe, Deshapriya Park", lat: 22.5195, lng: 88.3550 },
  { name: "Starbucks, Park Street", lat: 22.5520, lng: 88.3522 },
  { name: "Starbucks, South City Mall", lat: 22.5016, lng: 88.3617 },
  { name: "Starbucks, Salt Lake Sector V", lat: 22.5740, lng: 88.4345 },
  { name: "Smoke House Deli, Quest Mall", lat: 22.5392, lng: 88.3658 },
  { name: "Paris Cafe, Salt Lake Sector V", lat: 22.5725, lng: 88.4330 },
  { name: "Cafe Mezzuna, Forum Mall (Elgin Rd)", lat: 22.5385, lng: 88.3510 },
  { name: "Peter Cat, Park Street", lat: 22.5518, lng: 88.3528 },
  { name: "Mocambo Restaurant & Cafe, Park Street", lat: 22.5515, lng: 88.3520 },
  { name: "Biker's Cafe, Silver Arcade (EM Bypass)", lat: 22.5420, lng: 88.3985 },
  { name: "Country Roads Microbrewery & Cafe, New Town", lat: 22.5950, lng: 88.4710 },
  { name: "Indian Coffee House, College Street", lat: 22.5745, lng: 88.3638 },
  { name: "Karma Kettle Tea Lounge, Ballygunge", lat: 22.5285, lng: 88.3650 },
];

const KOLKATA_PETROL_PUMPS = [
  { name: "Indian Oil Petrol Pump, Park Circus 7-Point", lat: 22.5415, lng: 88.3685 },
  { name: "Bharat Petroleum Pump, Ruby (EM Bypass)", lat: 22.5150, lng: 88.4005 },
  { name: "HP Auto Care Petrol Pump, Camac Street", lat: 22.5410, lng: 88.3520 },
  { name: "Indian Oil COCO, VIP Road Kankurgachi", lat: 22.5850, lng: 88.3980 },
  { name: "BPCL Petrol Pump, Salt Lake Sector V", lat: 22.5710, lng: 88.4310 },
  { name: "HP Petrol Pump, Gariahat Road", lat: 22.5220, lng: 88.3645 },
  { name: "Indian Oil Petrol Pump, Strand Road Riverfront", lat: 22.5780, lng: 88.3470 },
  { name: "BPCL Petrol Pump, Prince Anwar Shah Road", lat: 22.5025, lng: 88.3580 },
  { name: "Indian Oil Pump, Rajarhat Main Road New Town", lat: 22.5910, lng: 88.4650 },
  { name: "HPCL Petrol Pump, Alipore Road", lat: 22.5320, lng: 88.3340 },
];

const KOLKATA_HOSPITALS = [
  { name: "SSKM Hospital & IPGMER Emergency", lat: 22.5390, lng: 88.3440 },
  { name: "Ruby General Hospital, EM Bypass", lat: 22.5135, lng: 88.4013 },
  { name: "Apollo Gleneagles Hospital, EM Bypass", lat: 22.5730, lng: 88.4030 },
  { name: "Fortis Hospital, Anandapur EM Bypass", lat: 22.5190, lng: 88.4020 },
  { name: "AMRI Hospital, Dhakuria", lat: 22.5090, lng: 88.3650 },
  { name: "Belle Vue Clinic, Dr UN Brahmachari St", lat: 22.5430, lng: 88.3540 },
  { name: "Medica Superspecialty Hospital, Mukundapur", lat: 22.4930, lng: 88.4000 },
  { name: "Calcutta Medical College Hospital, College St", lat: 22.5730, lng: 88.3610 },
  { name: "Woodlands Multispeciality Hospital, Alipore", lat: 22.5330, lng: 88.3320 },
];

function findNearestProximityPOI(
  query: string,
  currentLat: number,
  currentLng: number
): { coord: Coordinate; name: string } | null {
  const q = query.toLowerCase();

  let targetList: Array<{ name: string; lat: number; lng: number }> | null = null;
  let categoryLabel = "";

  if (/metro|subway|মেট্রো|मेट्रो/i.test(q)) {
    targetList = KOLKATA_METRO_STATIONS;
    categoryLabel = "Nearest Metro";
  } else if (/fine\s*dine|cafe|coffee|ক্যাফে|कैफ़े/i.test(q)) {
    targetList = KOLKATA_FINE_DINE_CAFES;
    categoryLabel = "Nearest Fine Dine Cafe";
  } else if (/petrol|fuel|gas|পাম্প|पेट्रोल/i.test(q)) {
    targetList = KOLKATA_PETROL_PUMPS;
    categoryLabel = "Nearest Fuel Station";
  } else if (/hospital|clinic|emergency|হাসপাতাল|अस्पताल/i.test(q)) {
    targetList = KOLKATA_HOSPITALS;
    categoryLabel = "Nearest Emergency Hospital";
  }

  if (!targetList || targetList.length === 0) {
    return null;
  }

  let closest: { name: string; lat: number; lng: number; dist: number } | null = null;

  for (const poi of targetList) {
    const dist = calculateHaversineMeters(currentLat, currentLng, poi.lat, poi.lng);
    if (!closest || dist < closest.dist) {
      closest = { ...poi, dist };
    }
  }

  if (closest) {
    const distText = formatDistance(closest.dist);
    return {
      coord: { latitude: closest.lat, longitude: closest.lng },
      name: `${closest.name} (${categoryLabel} • ${distText})`,
    };
  }

  return null;
}

async function searchNearbyNominatim(
  query: string,
  currentLat: number,
  currentLng: number
): Promise<{ coord: Coordinate; name: string } | null> {
  try {
    const cleanCategory = query
      .replace(/nearest|near\s*me|near\s*my\s*location|of\s*my\s*location|around\s*me|কাছের|সামনে|पास\s*का|के\s*पास/gi, "")
      .replace(/[,\.\-]/g, " ")
      .trim();

    if (!cleanCategory) return null;

    const delta = 0.045; // ~5 km box
    const nomUrl = new URL("https://nominatim.openstreetmap.org/search");
    nomUrl.searchParams.set("format", "json");
    nomUrl.searchParams.set("q", `${cleanCategory}, Kolkata`);
    nomUrl.searchParams.set(
      "viewbox",
      `${currentLng - delta},${currentLat + delta},${currentLng + delta},${currentLat - delta}`
    );
    nomUrl.searchParams.set("bounded", "1");
    nomUrl.searchParams.set("limit", "1");

    const res = await fetch(nomUrl, {
      headers: { "User-Agent": "VoiceSarathi-HUD/1.0" },
      signal: AbortSignal.timeout(4_000),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return {
          coord: { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) },
          name: data[0].display_name.split(",")[0] || cleanCategory,
        };
      }
    }
  } catch {}
  return null;
}

function lookupKolkataLandmark(query: string) {
  const clean = query
    .trim()
    .toLowerCase()
    .replace(/^(via|take via|through|হয়ে|হয়ে|ভায়া|वाया)\s+/i, "")
    .replace(/[,\.\-\_]/g, " ")
    .replace(/\s+/g, " ");

  if (KOLKATA_LANDMARKS[clean]) {
    return KOLKATA_LANDMARKS[clean];
  }

  for (const [key, value] of Object.entries(KOLKATA_LANDMARKS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return value;
    }
  }

  return null;
}

async function resolveLocationWithGemini(rawLocation: string, geminiKey: string): Promise<string> {
  try {
    const prompt = `The user is a motorcycle rider navigating in or around Kolkata, West Bengal, India.
Location/waypoint requested: "${rawLocation}".
If it is in Hindi, Bengali, Hinglish, or colloquial phrasing (e.g. "साउथ सिटी मॉल", "হাবড়া ব্রিজ", "মা ফ্লাইওভার", "वाया विद्यासागर सेतु"), translate and standardize it into the English location name with Kolkata context (e.g. "South City Mall, Kolkata", "Howrah Bridge, Kolkata", "Maa Flyover, Kolkata").
Output ONLY the clean English location name, with no punctuation or explanation.`;

    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=" +
        geminiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 60, temperature: 0.1 },
        }),
        signal: AbortSignal.timeout(4_000),
      }
    );
    if (!res.ok) return rawLocation;
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || rawLocation;
  } catch {
    return rawLocation;
  }
}

async function geocodeLocation(
  query: string,
  googleApiKey?: string,
  geminiApiKey?: string,
  currentLat?: number,
  currentLng?: number
): Promise<{ coord: Coordinate; name: string } | null> {
  // 0. Proximity / Nearest POI search if coordinates are available
  if (currentLat !== undefined && currentLng !== undefined) {
    const isProximity =
      /nearest|near\s*me|near\s*my|of\s*my\s*location|around\s*me|কাছের|সামনে|पास|समीप/i.test(query) ||
      /^metro(\s*station)?$/i.test(query.trim()) ||
      /^cafe$/i.test(query.trim()) ||
      /^fine\s*dine(\s*cafe)?$/i.test(query.trim()) ||
      /^petrol(\s*pump)?$/i.test(query.trim()) ||
      /^hospital$/i.test(query.trim());

    if (isProximity) {
      const nearestMatch = findNearestProximityPOI(query, currentLat, currentLng);
      if (nearestMatch) {
        return nearestMatch;
      }

      // Also try nearby Nominatim search for other dynamic categories (pharmacy, bakery, atm, etc.)
      const nomNearby = await searchNearbyNominatim(query, currentLat, currentLng);
      if (nomNearby) {
        return nomNearby;
      }
    }
  }

  // 1. Direct dictionary lookup
  const directMatch = lookupKolkataLandmark(query);
  if (directMatch) {
    return {
      coord: { latitude: directMatch.lat, longitude: directMatch.lng },
      name: directMatch.name,
    };
  }

  // 2. Semantic enhancement if non-ASCII
  let searchTerms: string[] = [query];
  if (geminiApiKey && /[^\u0000-\u007F]/.test(query)) {
    const resolved = await resolveLocationWithGemini(query, geminiApiKey);
    if (resolved && resolved !== query) {
      searchTerms.unshift(resolved);
      const reCheck = lookupKolkataLandmark(resolved);
      if (reCheck) {
        return {
          coord: { latitude: reCheck.lat, longitude: reCheck.lng },
          name: reCheck.name,
        };
      }
    }
  }

  // 3. Google Geocoding if available
  if (googleApiKey) {
    for (const term of searchTerms) {
      try {
        const geocodeUrl = new URL("https://maps.googleapis.com/maps/api/geocode/json");
        geocodeUrl.searchParams.set("address", term.includes("Kolkata") ? term : `${term}, Kolkata, India`);
        geocodeUrl.searchParams.set("key", googleApiKey);
        const geocodeResponse = await fetch(geocodeUrl, { signal: AbortSignal.timeout(3_000) });
        const geocode = await geocodeResponse.json();

        if (geocode.status === "OK" && geocode.results?.[0]?.geometry?.location) {
          const loc = geocode.results[0].geometry.location;
          return {
            coord: { latitude: loc.lat, longitude: loc.lng },
            name: geocode.results[0].formatted_address.split(",")[0] || term,
          };
        }
      } catch {}
    }
  }

  // 4. OpenStreetMap Nominatim
  for (const term of searchTerms) {
    const candidates = [
      term.includes("Kolkata") ? term : `${term}, Kolkata`,
      term,
    ];
    for (const c of candidates) {
      try {
        const nomUrl = new URL("https://nominatim.openstreetmap.org/search");
        nomUrl.searchParams.set("format", "json");
        nomUrl.searchParams.set("q", c);
        nomUrl.searchParams.set("limit", "1");
        nomUrl.searchParams.set("countrycodes", "in");

        const nomRes = await fetch(nomUrl, {
          headers: { "User-Agent": "VoiceSarathi-HUD/1.0" },
          signal: AbortSignal.timeout(4_000),
        });

        if (nomRes.ok) {
          const nomData = await nomRes.json();
          if (Array.isArray(nomData) && nomData.length > 0) {
            return {
              coord: { latitude: parseFloat(nomData[0].lat), longitude: parseFloat(nomData[0].lon) },
              name: nomData[0].display_name.split(",")[0] || term,
            };
          }
        }
      } catch {}
    }
  }

  return null;
}

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: number): string {
  const mins = Math.max(1, Math.round(seconds / 60));
  if (mins < 60) {
    return `${mins} min${mins === 1 ? "" : "s"}`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (remainingMins === 0) {
    return `${hours} hr${hours === 1 ? "" : "s"}`;
  }
  return `${hours} hr ${remainingMins} min`;
}

function parseDurationSeconds(durationStrOrNum: unknown): number {
  if (typeof durationStrOrNum === "number") return durationStrOrNum;
  if (typeof durationStrOrNum === "string") {
    const cleaned = durationStrOrNum.replace("s", "");
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
}

function calculateHaversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function encodeCoordinate(num: number): string {
  let v = Math.round(num * 1e5);
  v = v < 0 ? ~(v << 1) : v << 1;
  let str = "";
  while (v >= 0x20) {
    str += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
    v >>= 5;
  }
  str += String.fromCharCode(v + 63);
  return str;
}

function encodePath(points: [number, number][]): string {
  let prevLat = 0;
  let prevLng = 0;
  let res = "";
  for (const [lat, lng] of points) {
    res += encodeCoordinate(lat - prevLat);
    res += encodeCoordinate(lng - prevLng);
    prevLat = lat;
    prevLng = lng;
  }
  return res;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const input = body as {
    currentLat?: unknown;
    currentLng?: unknown;
    destination?: unknown;
    via?: unknown;
  } | null;

  if (
    !input ||
    !isLatitude(input.currentLat) ||
    !isLongitude(input.currentLng) ||
    typeof input.destination !== "string" ||
    !input.destination.trim()
  ) {
    return NextResponse.json(
      { error: "currentLat, currentLng, and destination are required." },
      { status: 400 }
    );
  }

  const currentLat = input.currentLat as number;
  const currentLng = input.currentLng as number;
  const rawDestinationQuery = input.destination.trim();
  const rawViaQuery = typeof input.via === "string" && input.via.trim() ? input.via.trim() : null;

  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  // -------------------------------------------------------------
  // 1. GEOCODE DESTINATION
  // -------------------------------------------------------------
  const destResult = await geocodeLocation(rawDestinationQuery, googleApiKey, geminiApiKey, currentLat, currentLng);
  if (!destResult) {
    return NextResponse.json(
      { error: `Could not locate destination "${rawDestinationQuery}". Please try another location.` },
      { status: 422 }
    );
  }
  const destinationCoord = destResult.coord;
  const resolvedDestinationName = destResult.name;

  // -------------------------------------------------------------
  // 2. GEOCODE VIA WAYPOINT (IF SPECIFIED FOR REROUTING)
  // -------------------------------------------------------------
  let viaResult: { coord: Coordinate; name: string } | null = null;
  if (rawViaQuery) {
    viaResult = await geocodeLocation(rawViaQuery, googleApiKey, geminiApiKey, currentLat, currentLng);
    if (viaResult) {
      console.log(`[route] Rerouting via waypoint: "${rawViaQuery}" -> ${viaResult.name}`);
    } else {
      console.warn(`[route] Could not locate via waypoint "${rawViaQuery}", continuing direct route.`);
    }
  }

  // -------------------------------------------------------------
  // 3. ROUTE COMPUTATION (GOOGLE ROUTES / OSRM MULTI-WAYPOINT)
  // -------------------------------------------------------------
  let polyline: string | undefined;
  let distanceMeters = 0;
  let durationSeconds = 0;
  let steps: Array<{ instruction: string; distance: number }> = [];

  // Try Google Routes API first if configured
  if (googleApiKey) {
    try {
      const intermediates = viaResult
        ? [{ location: { latLng: { latitude: viaResult.coord.latitude, longitude: viaResult.coord.longitude } } }]
        : [];

      const routesResponse = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": googleApiKey,
          "X-Goog-FieldMask":
            "routes.polyline.encodedPolyline,routes.distanceMeters,routes.duration,routes.legs.distanceMeters,routes.legs.duration,routes.legs.steps.navigationInstruction.instructions,routes.legs.steps.distanceMeters",
        },
        body: JSON.stringify({
          origin: { location: { latLng: { latitude: currentLat, longitude: currentLng } } },
          destination: { location: { latLng: destinationCoord } },
          intermediates,
          travelMode: "TWO_WHEELER",
          languageCode: "en-IN",
          units: "METRIC",
        }),
        signal: AbortSignal.timeout(8_000),
      });

      if (routesResponse.ok) {
        const result = await routesResponse.json();
        const route = result?.routes?.[0];
        if (route?.polyline?.encodedPolyline) {
          polyline = route.polyline.encodedPolyline;
          distanceMeters = route.distanceMeters || route.legs?.[0]?.distanceMeters || 0;
          durationSeconds = parseDurationSeconds(route.duration || route.legs?.[0]?.duration);

          steps = (route.legs || []).flatMap(
            (leg: {
              steps?: Array<{
                navigationInstruction?: { instructions?: string };
                distanceMeters?: number;
              }>;
            }) =>
              (leg.steps || []).map((step) => ({
                instruction: step.navigationInstruction?.instructions || "Continue on route",
                distance: step.distanceMeters || 0,
              }))
          );
        }
      }
    } catch (e) {
      console.warn("[route] Google Routes API failed:", e);
    }
  }

  // Fallback to OSRM (with multi-waypoint support!)
  if (!polyline) {
    try {
      console.log(`[route] Calculating route via OSRM (Via: ${viaResult ? viaResult.name : "None"})...`);
      let osrmCoordinates = `${currentLng},${currentLat};`;
      if (viaResult) {
        osrmCoordinates += `${viaResult.coord.longitude},${viaResult.coord.latitude};`;
      }
      osrmCoordinates += `${destinationCoord.longitude},${destinationCoord.latitude}`;

      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${osrmCoordinates}?overview=full&geometries=polyline&steps=true`;
      const osrmRes = await fetch(osrmUrl, { signal: AbortSignal.timeout(8_000) });

      if (osrmRes.ok) {
        const osrmData = await osrmRes.json();
        const route = osrmData?.routes?.[0];
        if (route && route.geometry) {
          polyline = route.geometry;
          distanceMeters = Math.round(route.distance || 0);
          durationSeconds = Math.round(route.duration || 0);

          const legs = route.legs || [];
          for (const leg of legs) {
            const legSteps = leg.steps || [];
            for (const s of legSteps) {
              const instruction =
                s.maneuver?.instruction ||
                (s.maneuver?.type && s.name
                  ? `${s.maneuver.type} onto ${s.name}`
                  : s.name
                  ? `Continue along ${s.name}`
                  : "Proceed along route");
              steps.push({
                instruction,
                distance: Math.round(s.distance || 0),
              });
            }
          }
        }
      }
    } catch (osrmErr) {
      console.warn("[route] OSRM routing failed:", osrmErr);
    }
  }

  // High-reliability geometric fallback
  if (!polyline) {
    const points: [number, number][] = [[currentLat, currentLng]];
    if (viaResult) {
      points.push([viaResult.coord.latitude, viaResult.coord.longitude]);
    }
    points.push([destinationCoord.latitude, destinationCoord.longitude]);

    let totalDist = 0;
    for (let i = 0; i < points.length - 1; i++) {
      totalDist += calculateHaversineMeters(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1]);
    }

    distanceMeters = Math.round(totalDist * 1.3);
    durationSeconds = Math.round(distanceMeters / 8.33);
    polyline = encodePath(points);

    steps = [
      ...(viaResult ? [{ instruction: `Proceed via ${viaResult.name}`, distance: Math.round(distanceMeters * 0.4) }] : []),
      { instruction: `Continue to ${resolvedDestinationName}`, distance: Math.round(distanceMeters * (viaResult ? 0.6 : 1.0)) },
    ];
  }

  const distanceText = formatDistance(distanceMeters);
  const durationText = formatDuration(durationSeconds);

  return NextResponse.json({
    polyline,
    distance: distanceMeters,
    distanceText,
    duration: durationSeconds,
    durationText,
    origin: {
      lat: currentLat,
      lng: currentLng,
    },
    via: viaResult
      ? {
          lat: viaResult.coord.latitude,
          lng: viaResult.coord.longitude,
          name: viaResult.name,
        }
      : null,
    destination: {
      lat: destinationCoord.latitude,
      lng: destinationCoord.longitude,
      name: resolvedDestinationName,
    },
    steps,
  });
}
