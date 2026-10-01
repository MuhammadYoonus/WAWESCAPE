import { destinationImages, packageImages, shortTourImages } from "../assets/images/imageCatalog";

export const destinations = [
  {
    name: "Ella",
    region: "Hill Country",
    image: destinationImages.ella,
    summary: "Tea estates, Nine Arch Bridge, Little Adam's Peak and slow mountain mornings.",
    bestFor: ["Train rides", "Hiking", "Views"]
  },
  {
    name: "Mirissa",
    region: "South Coast",
    image: destinationImages.mirissa,
    summary: "Palm-fringed beaches, whale watching, seafood dinners and relaxed coastal stays.",
    bestFor: ["Beach", "Whales", "Sunsets"]
  },
  {
    name: "Sigiriya",
    region: "Cultural Triangle",
    image: destinationImages.sigiriya,
    summary: "Ancient rock fortress, village tours, temples and heritage day trips.",
    bestFor: ["History", "Culture", "Photos"]
  },
  {
    name: "Yala",
    region: "Wildlife Coast",
    image: destinationImages.yala,
    summary: "Jeep safaris through dry-zone jungle with chances to spot elephants and leopards.",
    bestFor: ["Safari", "Wildlife", "Nature"]
  },
  {
    name: "Kandy",
    region: "Central Province",
    image: destinationImages.kandy,
    summary: "Temple of the Tooth, lake walks, botanical gardens and cultural shows.",
    bestFor: ["Culture", "Gardens", "City"]
  },
  {
    name: "Galle",
    region: "South Coast",
    image: destinationImages.galle,
    summary: "Fort streets, boutique cafes, colonial walls and easy beach connections.",
    bestFor: ["Fort", "Food", "Walks"]
  }
];

export const packages = [
  {
    id: "mirissa-whale-watching",
    days: "short",
    title: "Mirissa Whale Watching",
    route: "Mirissa Harbor - Indian Ocean - Mirissa Beach",
    price: "LKR 12,500",
    image: shortTourImages.whaleWatching,
    plan: ["Early morning harbor check-in", "Guided whale watching boat trip", "Return to Mirissa beach area"]
  },
  {
    id: "galle-fort",
    days: "short",
    title: "Galle Fort Walk",
    route: "Galle Fort - Lighthouse - Dutch Streets",
    price: "LKR 8,500",
    image: shortTourImages.galleFort,
    plan: ["Fort wall and lighthouse walk", "Dutch street photo stops", "Cafe and shopping time"]
  },
  {
    id: "coconut-tree-hill",
    days: "short",
    title: "Mirissa Coconut Tree Hill",
    route: "Mirissa Beach - Coconut Tree Hill - Secret Beach",
    price: "LKR 7,500",
    image: shortTourImages.coconutTreeHill,
    plan: ["Pickup from Mirissa area", "Coconut Tree Hill photo stop", "Optional Secret Beach visit"]
  },
  {
    id: "snake-farm",
    days: "short",
    title: "Snake Farm Visit",
    route: "Local Reptile Farm - Nature Stop",
    price: "LKR 6,500",
    image: shortTourImages.snakeFarm,
    plan: ["Guided reptile farm visit", "Safety briefing and local education", "Return transfer"]
  },
  {
    id: "turtle-farm",
    days: "short",
    title: "Turtle Farm Visit",
    route: "Turtle Hatchery - Beach Stop",
    price: "LKR 6,500",
    image: shortTourImages.turtleFarm,
    plan: ["Visit turtle hatchery", "Learn about conservation work", "Beachside free time"]
  },
  {
    id: "turtle-beach",
    days: "short",
    title: "Turtle Beach",
    route: "Turtle Beach - Reef Area - Beach Relaxing",
    price: "LKR 7,500",
    image: shortTourImages.turtleBeach,
    plan: ["Transfer to Turtle Beach", "Relax by the reef and beach area", "Optional sunset photo stop"]
  },
  {
    id: "koggala-boat-safari",
    days: "short",
    title: "Koggala Boat Safari",
    route: "Koggala Lake - Mangroves - Cinnamon Island",
    price: "LKR 9,500",
    image: shortTourImages.koggalaBoatSafari,
    plan: ["Boat safari through Koggala Lake", "Mangrove and bird watching", "Cinnamon island village stop"]
  },
  {
    id: "jungle-beach",
    days: "short",
    title: "Jungle Beach",
    route: "Unawatuna - Jungle Beach - Coastal Viewpoint",
    price: "LKR 8,500",
    image: shortTourImages.jungleBeach,
    plan: ["Pickup from Galle or Unawatuna", "Relax at Jungle Beach", "Optional coastal viewpoint stop"]
  },
  {
    id: "weligama-beach",
    days: "short",
    title: "Weligama Beach",
    route: "Weligama Bay - Surf Beach - Local Seafood Stop",
    price: "LKR 8,000",
    image: shortTourImages.weligamaBeach,
    plan: ["Beach transfer to Weligama Bay", "Surf watching or beginner surf time", "Seafood cafe stop before return"]
  },
  {
    id: "udawalawa-safari",
    days: "short",
    title: "Udawalawa Safari",
    route: "Udawalawa National Park - Elephant Transit Area",
    price: "LKR 22,500",
    image: shortTourImages.udawalawaSafari,
    plan: ["Early pickup for safari timing", "Jeep safari through Udawalawa National Park", "Optional elephant transit area visit"]
  },
  {
    id: "yala-safari",
    days: 1,
    title: "Yala Safari",
    route: "Tissamaharama - Yala National Park",
    price: "LKR 24,500",
    image: shortTourImages.yalaSafari,
    plan: ["Early morning pickup", "Yala jeep safari with guide", "Lunch and return transfer"]
  },
  {
    id: "ella-nine-arch",
    days: 1,
    title: "Ella Nine Arch Bridge",
    route: "Ella - Nine Arch Bridge - Little Adam's Peak",
    price: "LKR 18,500",
    image: shortTourImages.nineArchBridge,
    plan: ["Scenic drive to Ella", "Nine Arch Bridge walk and photo stop", "Little Adam's Peak viewpoint"]
  },
  {
    id: "ella-two",
    days: 2,
    title: "Ella Mountain Weekend",
    route: "Nuwara Eliya - Ella - Ravana Falls",
    price: "LKR 39,500",
    image: packageImages.ellaTwo,
    plan: ["Day 1: Tea country drive, waterfalls and Ella town", "Day 2: Little Adam's Peak, Nine Arch Bridge and return"]
  },
  {
    id: "wild-two",
    days: 2,
    title: "Yala Safari Break",
    route: "Tissamaharama - Yala - Kataragama",
    price: "LKR 44,000",
    image: packageImages.wildTwo,
    plan: ["Day 1: Lagoon stop, hotel check-in and temple visit", "Day 2: Early morning jeep safari and coastal lunch"]
  },
  {
    id: "classic-three",
    days: 3,
    title: "Classic Sri Lanka Mini Round Tour",
    route: "Sigiriya - Kandy - Ella",
    price: "LKR 68,000",
    image: packageImages.classicThree,
    plan: ["Day 1: Sigiriya Rock and village lunch", "Day 2: Kandy temple, gardens and hill-country drive", "Day 3: Ella viewpoints, waterfalls and return"]
  },
  {
    id: "beach-three",
    days: 3,
    title: "Beach, Fort and Whale Route",
    route: "Bentota - Galle - Mirissa",
    price: "LKR 59,000",
    image: packageImages.beachThree,
    plan: ["Day 1: Bentota river safari and beach stay", "Day 2: Galle Fort walk and Unawatuna swim", "Day 3: Mirissa whale watching and sunset"]
  }
];

export const feedbacks = [
  {
    name: "Ama Fernando",
    trip: "Ella Mountain Weekend",
    rating: 5,
    text: "The plan was smooth from pickup to the last stop. Our driver knew the quiet viewpoints and helped us avoid crowded times."
  },
  {
    name: "Daniel Brooks",
    trip: "Southern Coast Day Escape",
    rating: 5,
    text: "Great local knowledge, clean vehicle, and the lunch recommendation in Galle was excellent. Easy to recommend."
  },
  {
    name: "Priya Nair",
    trip: "Classic Sri Lanka Mini Round Tour",
    rating: 5,
    text: "WAWECAPE made three packed days feel relaxed. The tour plan had the right balance of culture, nature and rest."
  }
];
